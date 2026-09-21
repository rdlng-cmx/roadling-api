import Router from "@koa/router";
import read from "../../helpers/read.mts";
import { createSVGWindow } from 'svgdom'
import { SVG, registerWindow } from '@svgdotjs/svg.js'
import glyphs from './glyphs.mts';
import '@svgdotjs/svg.panzoom.js'
import { G } from "@svgdotjs/svg.js";
import { parse, structure, validateSyllable } from "./structure.mts";
import { Element } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";

const window = createSVGWindow()
const document = window.document

registerWindow(window, document)
const fale = read(import.meta.dirname + "/svg/fale.svg")

class Line implements Iterator<number | null> {
    private at = 0
    private _done: boolean = false
    get done() { return this._done }

    constructor(private spacing: number = 2, private margin: number = Infinity) {
    }
    public readonly words: G[] = []
    get height() {
        return this.words.map(word => word.bbox().height).reduce((max, current) => {
            return current > max ? current : max;
        })
    }
    align() {
        for (const word of this.words) {
            word.y(this.height - word.bbox().height)
        }
    }
    next(word: G): IteratorResult<number | null> {
        if (this.done) return { value: null, done: true }
        if (this.at > this.margin) {
            this._done = true
            return { value: null, done: true }
        }
        this.words.push(word)
        this.align()
        this.at += word.bbox().width + this.spacing
        return { value: this.at, done: false }
    }
}
class Text implements Iterator<[number, number]> {
    public currentLine: Line | null = null
    constructor(private svg: Svg, private stroke: string = "#000", private spacing: number = 2, private margin: number = Infinity) {
        this.group = this.svg.group().stroke({
            color: this.stroke,
            width: 1,
            linecap: "round",
            linejoin: "round"
        })
    }
    next(word: G): IteratorResult<[number, number]> {
        if (!this.currentLine || this.currentLine.done) this.currentLine = new Line(this.spacing, this.margin)
        word.move(this._x, 0)

        const result = this.currentLine.next(word)


        this._x = result.value

        return { value: this.cursor, done: false }
    }
    public readonly group: G
    private _x: number = 0
    private _y: number = 0
    get cursor(): [number, number] { return [this._x, this._y] }
}
const canvas = SVG().group()
canvas.svg(fale)
const setGrab = (to: Element) => (glyph: string) => canvas.find("#" + glyph)[0]?.clone().untransform().move(0, 0).addTo(to) ?? null
const writeHook = (consonants: [Element?, Element?]) => {
    
}
const writeSyllable = (syllable: string, group: G, stroke?: string) => {
    console.log(parse(syllable))
    const validSyllable = validateSyllable(syllable)
    if (!validSyllable) return group;

    validSyllable
    const { onset, coda, nucleus } = structure.exec(syllable)?.groups!
    console.log(onset, nucleus, coda)
    const setVowel = (vowel: string, consonant: Element) => {
        const data = glyphs.vowels.get(vowel)
        if (!data?.glyph) return;
        const glyph = grab(data.glyph)
        const { width: consonantWidth, x: consonantX, y: consonantY } = consonant.bbox()
        const { width: vowelWidth, height: vowelHeight } = glyph.bbox()
        glyph.move(consonantX + consonantWidth / 2 - vowelWidth / 2, consonantY - 1.5 - vowelHeight)

    }
    const { consonants } = glyphs
    const grab = setGrab(group)
    const find = (glyph: string) => consonants.get(glyph)
    if (!onset) {
        if (!coda) {
            const empty = grab("empty").move(0, 0)
            setVowel(nucleus, empty)
        }
        else {
            const data = find(coda)
            const { hook, extend } = data!
            const hookY = (hook === "top" || hook === "top-bottom") ? "top" : "bottom"
            const open = grab("open-" + hookY)
            const closingGlyph = grab(coda)
            closingGlyph.move(open.bbox().width, hookY === "top" ? 0 : open.bbox().height - closingGlyph.bbox().height).flip('x')
            closingGlyph
            const {x: closingGlyphX, y: closingGlyphY, x2: closingGlyphX2, y2: closingGlyphY2} = closingGlyph.bbox()
            const {x: openX, y: openY, x2: openX2, y2: openY2} = open.bbox()
            const lineY = hookY === "bottom" ? closingGlyphY2 : closingGlyphY
            
            
            setVowel(nucleus, closingGlyph)
            if (extend) group.line(openX2, lineY, openX2 + (extend[1] ?? 0), lineY).stroke({
                    width: 1,
                    linecap: "round",
                    linejoin: "round"
                })
        }
    }
    else {
        const openingGlyph = grab(onset).move(0, 0)
        if (!coda) {
            const data = find(onset)
            const hookY = (data?.hook === "top" || data?.hook === "top-bottom") ? "top" : "bottom"
            if (validSyllable.includes("stressed")) {
                const open = grab("open-" + hookY)
                open.move(openingGlyph.bbox().width, hookY === "top" ? 0 : openingGlyph.bbox().height - open.bbox().height).flip('x')
            }
        }
        else {
            const data = [find(onset), find(coda)]
            console.log(data)
            if (!data[0] || !data[1]) return group;
            const space = openingGlyph.bbox().width + 2
            const except = data[0]?.except?.find(data => data.glyph === coda)
            const extend: [number, number] = (except as unknown as {
                extend?: [number, number]
            })?.extend ?? [data[0]?.extend?.[0] ?? 0, data[1]?.extend?.[1] ?? 0]
            const closingGlyph = grab(coda).move(space, 0).flip('x')
            const goBy = except ?? data[0]
            const hook = goBy.hook === true ? data[1]?.hook === true ? "top" : data[1]?.hook : goBy.hook === false ? false : goBy.hook
            const hookY = hook === "top" ? [0, 0] : hook === "top-bottom" ? [0, openingGlyph.bbox().height] : hook === "bottom-top" ? [openingGlyph.bbox().height, 0] : [openingGlyph.bbox().height, openingGlyph.bbox().height]

            if (hook) group.line(extend[0] === 4 ? 0 : openingGlyph.bbox().width - extend[0], hookY[0], space + (extend[1] * (closingGlyph.bbox().width as number / 4)), hookY[1]).stroke({
                width: 1,
                linecap: "round",
                linejoin: "round"
            })
        }
        if (validSyllable.includes("stressed")) setVowel(nucleus, openingGlyph)
    }
    return group
}

const router = new Router()
    .prefix('/fale')
    .get('/', async (ctx, next) => {
        const content = SVG()
        const text = new Text(content)
        const { get } = ctx.query
        console.log(get)
        if (Array.isArray(get)) return;
        if (!get) {
            ctx.body = canvas.svg()
            await next();
            return;
        }
        if (get.length === 1) {
            const grab = setGrab(content)
            if (get) grab(get);
        }
        else {
            text.next(writeSyllable(get, text.group.group()))
        }
        const { x, y, width, height } = content.group().add(text.group).bbox()
        content.viewbox({ x: x - 0.5, y: y - 0.5, width: width + 1, height: height + 1 })
        content.attr("height", 100)
        content.attr("preserveAspectRatio", "xMinYMin meet")
        ctx.body = content.svg()
        ctx.set("Content-Type", "image/svg+xml")
        await next()
    })
    .post('/', async (ctx, next) => {
        const content = SVG()
        interface Body {
            syllables: string[],
            stroke: string
        }
        const { syllables, stroke } = ctx.request.body as Body
        const text = new Text(content, stroke)
        for (const syllable of syllables) {
            text.next(writeSyllable(syllable, text.group.group()))
        }
        const { x, y, width, height } = content.group().add(text.group).bbox()
        content.viewbox({ x: x - 0.5, y: y - 0.5, width: width + 1, height: height + 1 })
        content.attr("height", 100)
        content.attr("preserveAspectRatio", "xMinYMin meet")
        ctx.body = content.svg()
        ctx.set("Content-Type", "image/svg+xml")
        await next()
    })

export default router