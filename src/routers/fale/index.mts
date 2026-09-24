import Router from "@koa/router";
import read from "../../helpers/read.mts";
import { createSVGWindow } from 'svgdom'
import { SVG, registerWindow } from '@svgdotjs/svg.js'

import '@svgdotjs/svg.panzoom.js'
import { G } from "@svgdotjs/svg.js";
import { parse, structure, validateSyllable } from "./structure.mts";
import { Element } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { Fale, FaleOptions } from "./fale.ts";
import sharp from "sharp";

const window = createSVGWindow()
const document = window.document

registerWindow(window, document)
const fale = read(import.meta.dirname + "/svg/fale.svg").replaceAll("stroke:#000000;", "")
const canvas = SVG().group()
Fale.glyphs = canvas.svg(fale)

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
    constructor(private svg: Svg, private stroke: string = "#000", private spacing: number = 1.5, private margin: number = Infinity) {
        this.group = this.svg.group().stroke({
            color: this.stroke,
            width: 1,
            linecap: "round",
            linejoin: "round"
        })
    }
    fale = (syllable: string, options?: FaleOptions) => {
        return new Fale(this.group, syllable, options)
    }
    next(fale: Fale): IteratorResult<[number, number]> {
        if (!this.currentLine || this.currentLine.done) this.currentLine = new Line(this.spacing, this.margin)
        fale.syllable.move(this._x, 0)

        const result = this.currentLine.next(fale.syllable)


        this._x = result.value

        return { value: this.cursor, done: false }
    }
    public readonly group: G
    private _x: number = 0
    private _y: number = 0
    get cursor(): [number, number] { return [this._x, this._y] }
}

const setGrab = (to: Element) => (glyph: string) => canvas.find("#" + glyph)[0]?.clone().untransform().move(0, 0).addTo(to) ?? null
// const hook = (consonants: [Element?, Element?]) => {
//     const [opener = "", closer] = consonants
//     const data = [glyphs.consonants.get(opener)]
//     const { hook, extend } = data
//     const hookY = (hook === "top" ) ? "top" : "bottom"
// }


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
            const fale = text.fale(get)
            text.next(fale)
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
            options: {
    stroke?: string,
    omitOpens?: boolean | "sometimes",
}
        }
        const { syllables, options } = ctx.request.body as Body
        const { stroke, omitOpens } = options
        const text = new Text(content, stroke)
        let stress = Infinity
        const faleOptions: FaleOptions = {
            omitOpens: omitOpens === true || (omitOpens === "sometimes" && syllables.length > 1)
        }
        for (const [index, syllable] of syllables.entries()) {
            
            faleOptions.flip = index === syllables.length - 1|| (index > stress && !syllable.includes('*'))
            const fale = text.fale(syllable, faleOptions)
            if (fale.attributes.has("invalid")) continue;
            if (fale.attributes.has("stress")) stress = index
            text.next(fale)
        }
        const { x, y, width, height } = content.group().add(text.group).bbox()
        content.viewbox({ x: x - 0.5, y: y - 0.5, width: width + 2, height: height + 1 })
        content.attr("height", 150)
        content.attr("preserveAspectRatio", "xMinYMin meet")
        const svgToPng = await sharp(Buffer.from(content.svg()))
        .png().toBuffer()
        ctx.body = svgToPng
        ctx.set("Content-Type", "image/png")
        await next()
    })

export default router