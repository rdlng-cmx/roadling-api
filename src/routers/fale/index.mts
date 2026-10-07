import Router from "@koa/router";
import read from "../../helpers/read.mts";
import { createSVGWindow } from 'svgdom'
import { SVG, registerWindow } from '@svgdotjs/svg.js'

import '@svgdotjs/svg.panzoom.js'
import '@svgdotjs/svg.filter.js'
import { G } from "@svgdotjs/svg.js";
import { parse, structure, validateSyllable } from "./structure.mts";
import { Element } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { Character, Dan, Fale, FaleOptions, Moja } from "./fale.ts";
import Defaults from './defaults.json' with {type: 'json'}
import sharp from "sharp";

const window = createSVGWindow()
const document = window.document

registerWindow(window, document)
const fale = read(import.meta.dirname + "/svg/fale.svg")
    .replaceAll("stroke:#000000;", "")
    .replaceAll("stroke-width:1;", "")
    .replaceAll("stroke-linecap:round;", "")
    .replaceAll("stroke-linejoin:round", "")
const canvas = SVG().group()
Character.glyphs = canvas.svg(fale)
type Sometimes = boolean | "sometimes"
interface Body {
    syllables: string[],
    options: {
        stroke?: string,
        opens?: Sometimes,
        vowels?: Sometimes,
        crisp?: boolean,
        bang?: boolean,
        alts?: Record<string, string>,
        jitter?: {
            baseFrequency: number
            numOctaves: number
            seed: number
            scale: number
        },
        girth?: number;
        height?: number;
        format?: "svg" | "png"
    }
}
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
    next(character: Character): IteratorResult<number | null> {
        if (this.done) return { value: null, done: true }
        if (this.at > this.margin) {
            this._done = true
            return { value: null, done: true }
        }
        this.words.push(character.character)
        this.align()
        this.at = character.character.bbox().x2 + this.spacing
        return { value: this.at, done: false }
    }
}
class Text implements Iterator<[number, number]> {
    public currentLine: Line | null = null
    constructor(private svg: Svg, private options: {
        stroke?: string
        girth?: number
        margin?: number
    }) {
        this.group = this.svg.group().stroke({
            color: options.stroke ?? "#fff",
            width: options.girth ?? 1,
            linecap: "round",
            linejoin: "round"
        })
    }
    dan = (num: string) => {
        return new Dan(this.group, num)
    }
    fale = (syllable: string, options?: FaleOptions) => {
        return new Fale(this.group, syllable, options)
    }
    moja = (moja: string) => {
        return new Moja(this.group, moja)
    }
    next(character: Character): IteratorResult<[number, number]> {
        if (!this.currentLine || this.currentLine.done) this.currentLine = new Line((this.options.girth ?? 1) + .5)
        let extraSpace = 0
        if (character instanceof Fale && character.diacritics[0] && this.currentLine.words.length > 0) {
            extraSpace = this.options.girth ?? 1
        }
        character.character.move(this._x + extraSpace, 0)

        const result = this.currentLine.next(character)


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
        const text = new Text(content, {
            girth: 0.5
        })
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
        const defaults = Defaults as unknown as Required<Body["options"]>
        const { syllables, options } = ctx.request.body as Body
        const {
            alts = defaults.alts,
            bang = defaults.bang,
            stroke = defaults.stroke,
            girth = defaults.girth,
            opens = defaults.opens,
            format = defaults.format,
            height = defaults.height,
            jitter = null,
            vowels = defaults.vowels,
            crisp = defaults.crisp } = options ?? defaults
        const text = new Text(content, {
            girth,
            stroke
        })
        let stress = Infinity
        const faleOptions: FaleOptions = {
            girth,
            opens: opens === true || (opens === "sometimes" && syllables.length > 1),
            vowel: (vowels === "sometimes" ? undefined : vowels) ?? undefined,
            alts
        }
        if (bang) text.next(text.moja("!bang-onset"))
        for (const [index, syllable] of syllables.entries()) {
            const characterClass: keyof Text = Fale.validate(syllable) ? "fale" : Moja.validate(syllable) ? "moja" : "dan"
            if (characterClass === "fale") {
                faleOptions.flip = index === syllables.length - 1 || (index > stress && !syllable.includes('*'))
                const fale = text.fale(syllable, faleOptions)
                if (fale.attributes.has("invalid")) continue;
                if (fale.attributes.has("stress")) stress = index
                text.next(fale)
            }
            if (characterClass === "moja") {
                text.next(text.moja(syllable))
            }
            if (characterClass === "dan") {
                console.log(syllable)
                text.next(text.dan(syllable))
            }
        }
        if (bang) text.next(text.moja("!bang"))
        if (jitter) content.filterWith(add => {
            const { baseFrequency = defaults.jitter.baseFrequency, numOctaves = defaults.jitter.numOctaves, seed = defaults.jitter.numOctaves, scale = defaults.jitter.scale } = jitter
            const turbulence = add.turbulence(baseFrequency, numOctaves, seed, 'noStitch', 'turbulence')
            add.displacementMap(add.$source, turbulence, scale, 'R', 'G')
        })
        const { x, y, width: contentWidth, height: contentHeight } = content.group().add(text.group).bbox()
        content.viewbox({ x: x - girth / 2, y: y - girth / 2, width: contentWidth + girth * 2, height: contentHeight + girth })
        content.attr("height", height)
        content.attr("preserveAspectRatio", "xMinYMin meet")
        if (crisp) content.attr("shape-rendering", "crispEdges")
        const file = format === "svg" ? content.svg() : await sharp(Buffer.from(content.svg()))
        [format]().toBuffer()
        ctx.body = file
        ctx.set("Content-Type", "image/" + format)
        await next()
    })

export default router