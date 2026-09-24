import { Element } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";

type Consonant = typeof Fale.consonants[number]
type Glide = typeof Fale.glides[number]
type Vowel = typeof Fale.vowels[number]
type Mark = typeof Fale.marks[number]
type Punctuation = typeof Fale.punctuation[number]

export interface FaleOptions {
    omitOpens?: boolean,
    flip?: boolean
}
interface GlyphData<N extends string> {
    glyph: N | undefined,
}

interface ConsonantData extends GlyphData<Consonant> {
    hook: "top" | "bottom" | boolean,
    extend?: [number, number],
    except?: ConsonantExcept[],
    alts?: {
        open?: string
        "hook-top"?: string
        "hook-bottom"?: string
    }
}
type ConsonantExcept = Omit<ConsonantData, "glyph"|"alts"|"except"> & {use?: string, glyph: Consonant|"open"} 
type FaleType<N extends string, T extends GlyphData<string> = GlyphData<N>> = Record<N, T>
export interface FaleData {
    consonants: FaleType<Consonant, ConsonantData>
    vowels: FaleType<Vowel>
    glides: FaleType<Glide, GlyphData<`glide-${Glide}`>>
    punctuation: FaleType<Punctuation>
}
type HasElement = { element: Element }
type ConsonantGlyph = ConsonantData & HasElement
type VowelGlyph = GlyphData<Vowel> & HasElement
type GlideGlyph = GlyphData<"glide-y" | "glide-w"> & HasElement
type SyllableAttribute = "closed" | "inflector" | "stress" | "invalid"

export class Fale {
    static glyphs: Element
    static readonly data: FaleData = {
        consonants: {
            p: {
                glyph: "p",
                extend: [
                    0,
                    2
                ],
                hook: "top"
            },
            b: {
                glyph: "b",
                extend: [
                    0,
                    2
                ],
                hook: "bottom"
            },
            t: {
                glyph: "t",
                hook: true,
                except: [
                    {
                        glyph: "l",
                        hook: "bottom",
                        extend: [
                            0,
                            0
                        ]
                    }
                ]
            },
            d: {
                glyph: "d",
                hook: true,
                except: [
                    {
                        glyph: "l",
                        hook: "bottom"
                    }
                ]
            },
            k: {
                glyph: "k",
                hook: "top",
                alts: {
                    "hook-bottom": "k-bottom"
                },
            },
            g: {
                glyph: "g",
                hook: "bottom",
                alts: {
                    "hook-top": "g-top"
                },
                except: [
                    {
                        glyph: "l",
                        hook: "bottom",
                        extend: [
                            0,
                            0
                        ]
                    },
                    {
                        glyph: "r",
                        hook: "bottom",
                        extend: [
                            0,
                            0
                        ]
                    }
                ]
            },
            r: {
                glyph: "r",
                hook: true,
                extend: [
                    4,
                    4
                ],
                alts: {
                    open: "r-open"
                },
                except: [
                    {
                        glyph: "g",
                        hook: "bottom",
                        extend: [
                            0,
                            0
                        ]
                    },
                    {
                        glyph: "n",
                        hook: "bottom",
                        extend: [
                            0,
                            0
                        ]
                    }
                ]
            },
            h: {
                glyph: "h",
                hook: "bottom",
                alts: {
                    open: "h-open"
                }
            },
            n: {
                glyph: "n",
                hook: true,
                alts: {
                    open: "n-open"
                }
            },
            hr: {
                glyph: "hr",
                hook: "top",
                alts: {
                    open: "hr-open"
                }
            },
            c: {
                glyph: "c",
                hook: "top",
                alts: {
                    "open": "c-open"
                }
            },
            dj: {
                glyph: "dj",
                hook: "top",
                except: [
                    {
                        glyph: "h",
                        hook: "bottom",
                        extend: [
                            0,
                            4
                        ]
                    }
                ]
            },
            tc: {
                glyph: "tc",
                hook: "top",
                except: [
                    {
                        glyph: "n",
                        hook: "top",
                        extend: [
                            0,
                            4
                        ]
                    }
                ]
            },
            s: {
                glyph: "s",
                hook: true,
                extend: [
                    2.4,
                    2.1
                ],
                alts: {
                    open: "s-open"
                }
            },
            dz: {
                glyph: "dz",
                hook: "top"
            },
            ts: {
                glyph: "ts",
                hook: "bottom",
                except: [
                    {
                        glyph: "h",
                        hook: "bottom",
                        extend: [
                            0,
                            4
                        ]
                    }
                ]
            },
            f: {
                glyph: "f",
                hook: true
            },
            m: {
                glyph: "m",
                hook: true,
                alts: {
                    open: "m-open"
                }
            },
            l: {
                glyph: "l",
                hook: true,
                extend: [
                    4,
                    4
                ],
                alts: {
                    open: "l-open"
                },
                except: [
                    {
                        glyph: "open",
                        hook: "bottom",
                        use: "l-open",
                        extend: [0, 0]
                    },
                    {
                        glyph: "b",
                        hook: "bottom",
                        use: "l-open",
                        extend: [0, 0]
                    },
                    {
                        glyph: "g",
                        hook: "bottom",
                        use: "l-open",
                        extend: [0, 0]
                    },
                    {
                        glyph: "h",
                        hook: "bottom",
                        use: "l-open",
                        extend: [0, 0]
                    }
                ]
            }
        },
        punctuation: {
            "open-bottom": { glyph: "open-bottom" },
            "open-top": { glyph: "open-top" }
        },
        glides: {
            w: {
                glyph: "glide-w"
            },
            y: {
                glyph: "glide-y"
            }
        },
        vowels: {
            a: { glyph: "a" },
            e: { glyph: undefined },
            i: { glyph: "i" },
            o: { glyph: "o" },
            u: { glyph: "u" }
        },
        
    }
    static readonly validSyllables: { [key: string]: Set<SyllableAttribute> } = {
        ".CV": new Set([]),
        "-V": new Set(["inflector",]),
        "-VC": new Set(["inflector", "closed"]),
        "*CV": new Set(["stress",]),
        "*CGV": new Set(["stress",]),
        "*CVG": new Set(["stress",]),
        "*CVC": new Set(["stress", "closed"]),
        "*CGVC": new Set(["stress", "closed"]),
        "*CVGC": new Set(["stress", "closed"]),
        "*CGVGC": new Set(["stress", "closed"]),
    }
    static readonly consonants = [
        "p", "b",
        "t", "d",
        "k", "g",
        "m", "n",
        "c", "s",
        "l", "f",
        "h", "hr",
        "ts", "tc",
        "dz", "dj",
        "r"
    ] as const;
    static readonly glides = [
        "y", "w"
    ] as const;

    static readonly vowels = [
        "a", "e", "i", "o", "u"
    ] as const;

    static readonly marks = [
        ".", "*", "-"
    ] as const;
    static readonly punctuation = [
        "open-top",
        "open-bottom",
        "open-top-y",
        "open-bottom-y",
        "open-top-w",
        "open-bottom-w"
    ]
    static readonly validate = (syllable: string) => new RegExp(`^(?<mark>${Fale.marks.map(mark => '\\' + mark).join("|")})(?<onset>${Fale.consonants.join("|")})?(?<glide1>${Fale.glides.join("|")})?(?<nucleus>${Fale.vowels.join("|")})(?<glide2>${Fale.glides.join("|")})?(?<coda>${Fale.consonants.join("|")})?$`).exec(syllable)
    static readonly parse = (syllable: string) => {
        const regex = Fale.validate(syllable)
        if (!regex?.groups) return "";
        const { mark, onset, glide1, nucleus, glide2, coda } = regex?.groups
        const realSyll = [mark, onset, glide1, nucleus, glide2, coda].filter(Boolean).join("|")
        return realSyll
            .split("|")
            .map(char => {
                if (Fale.marks.includes(char as Mark)) return char
                if (Fale.consonants.includes(char as Consonant)) return "C"
                if (Fale.vowels.includes(char as Vowel)) return "V"
                if (Fale.glides.includes(char as Glide)) return "G"
                else throw new Error()
            }).join("")
    }
    static readonly analyze = (syllable: string) => Fale.validSyllables[Fale.parse(syllable)] ?? new Set(["invalid"])
    private readonly grab = (glyph: string) => Fale.glyphs.find("#" + glyph)[0]?.clone().untransform().move(0, 0).addTo(this.syllable)
    private readonly setData = (syllable: string) => {
        const { onset, nucleus, coda, glide1, glide2 } = Fale.validate(syllable)?.groups! as { onset: Consonant, nucleus: Vowel, coda: Consonant, glide1: Glide, glide2: Glide }
        this.glides = [glide1, glide2].map(glyph => {
            if (!glyph) return undefined;
            return { element: this.grab("glide-"+glyph), ...Fale.data.glides[glyph] }
        }) as [GlideGlyph | undefined, GlideGlyph | undefined]
        this.vowel = { element: this.grab(nucleus), ...Fale.data.vowels[nucleus] }
        this.consonants = [onset, coda].map(glyph => {
            if (!glyph) return undefined;
            return { element: this.grab(glyph), ...Fale.data.consonants[glyph] }
        }) as [ConsonantGlyph | undefined, ConsonantGlyph | undefined]
    }
    private vowel!: VowelGlyph;
    private glides: [ GlideGlyph | undefined, GlideGlyph | undefined ] = [,,]
    private consonants: [ConsonantGlyph | undefined, ConsonantGlyph | undefined] = [, ,]
    public get attributes() {
        return Fale.analyze(this._syllable)
    }

    get onset() { return this.consonants[0] }
    get onsetGlyph() { return  this.onset!.element }
    set onsetGlyph(element: Element) { this.onset!.element = this.onset!.element.replace(element) }

    get coda() { return this.consonants[1] }
    get codaGlyph() { return this.coda!.element}
    set codaGlyph(element: Element) { this.coda!.element = this.coda!.element.replace(element) }

    get extension(): [number, number] { const [onset, coda] = this.consonants; return [onset?.extend?.[0] ?? 0, coda?.extend?.[1] ?? 0] }
    public readonly syllable: G

    // constructor
    constructor(target: G, private _syllable: string, private options: FaleOptions = {
        flip: false,
        omitOpens: true
    }) {
        this.syllable = target.group()

        const { attributes } = this
        if (attributes.has("invalid")) return;
        this.setData(_syllable)

        const { writeOpenInflector, writeClosedInflector, writeClosedSyllable, writeStressedOpenSyllable, writeOpenSyllable, writeVowel } = this
        if (attributes.has("inflector")) if (attributes.has("closed")) writeClosedInflector(); else;
        else if (attributes.has("closed")) writeClosedSyllable();
        else if (attributes.has("stress")) writeStressedOpenSyllable();
        else writeOpenSyllable();
        const [onset, coda] = this.consonants

        const head: Element = onset?.element ?? coda?.element ?? writeOpenInflector();
        if (attributes.has("stress") || attributes.has("inflector")) writeVowel(head)
    }

    //writing methods
    private readonly writeOpenInflector = () => {
        const nullGlyph = this.grab("null")
        if (this.options.flip) nullGlyph.flip('x')
        return nullGlyph
    }
    private readonly writeClosedInflector = () => {
        const { hook, element } = this.coda!
        const hookY = (hook === "top") ? "top" : "bottom"
        const open = this.grab("open-" + hookY)
        element.move(open.bbox().width, hookY === "top" ? 0 : open.bbox().height - element.bbox().height).flip('x')
        this.writeExtension([open, element], hookY)
    }
    private readonly writeClosedSyllable = () => {
        const [onset, coda] = this.consonants
        if (!onset || !coda) return;
        const space = this.onsetGlyph.bbox().width + 2
        const except = onset.except?.find(data => data.glyph === coda.glyph)
        const extension: [number, number] = (except as unknown as {
            extend?: [number, number]
        })?.extend ?? this.extension
        if (except?.use) this.onsetGlyph = this.grab(except.use)

        const goBy = except ?? onset
        const hook: "top" | "bottom" | false = goBy.hook === true ? coda?.hook === true ? "top" : coda?.hook : goBy.hook === false ? false : goBy.hook

        const hookAlt = "hook-" + hook as "hook-top" | "hook-bottom"
        if (coda.alts?.[hookAlt]) this.codaGlyph = this.grab(coda.alts[hookAlt])
        this.codaGlyph.move(space, 0).flip('x')

        if (hook) {

            this.writeExtension([this.onsetGlyph, this.codaGlyph], hook, extension)
        }
    }

    private readonly writeStressedOpenSyllable = () => {
        if (this.options.omitOpens) return this.writeOpenSyllable(false);
        const onset = this.consonants[0]!
        const { element, hook, except } = onset
        const exceptOpen = except?.find(data => data.glyph === "open")
        if (exceptOpen && exceptOpen.use) this.onsetGlyph = this.grab(exceptOpen.use)
        if (!hook) return;
        const y = (hook === true ? "bottom" : hook)
        const [glide1, glide2] = this.glides
        glide2?.element.remove()
        let glideOpen = glide2 ? "-" + glide2.glyph : ""
        const open = this.grab("open-" + y + glideOpen)
        open.move(element.bbox().width, hook === "top" ? 0 : element.bbox().height - open.bbox().height).flip('x')
        glide1?.element.move(-1.5,-1.5)
        this.writeExtension([onset.element, open], y, exceptOpen?.extend ?? this.extension)
    }
    private readonly writeOpenSyllable = (omitVowel: boolean = true) => {
        if (omitVowel) this.vowel.element?.remove()
        const onset = this.consonants[0]!
        if (onset.alts?.open) this.onsetGlyph = this.grab(onset.alts.open)
        if (this.options.flip) this.onsetGlyph.flip('x')
    }
    private readonly writeExtension = (elements: [Element, Element], y: "top" | "bottom" = "top", extension: [number, number] = this.extension) => {
        const { y: closingGlyphY, y2: closingGlyphY2 } = this.syllable.bbox()
        const { x: closingGlyphX, width: closingWidth } = elements[1].bbox()
        const { x2: openingX2, width: openingWidth } = elements[0].bbox()
        const lineY = y === "bottom" ? closingGlyphY2 : closingGlyphY
        const calculate = (n: number, m: number) => n === 4 ? m : n * (m / 4)
        this.syllable.line(openingX2 - calculate(extension[0], openingWidth), lineY, closingGlyphX + calculate(extension[1], closingWidth), lineY).stroke({
            width: 1,
            linecap: "round",
            linejoin: "round"
        })
    }
    private readonly writeVowel = (glyph: Element) => {
        console.log(glyph)
        console.log(this.vowel)
        const vowel = this.vowel.element
        if (!vowel) return;
        const { width: glyphWidth, x: glyphX, y: glyphY } = glyph.bbox()
        const { width: vowelWidth, height: vowelHeight } = vowel.bbox()
        vowel.move(glyphX + glyphWidth / 2 - vowelWidth / 2, glyphY - 1.5 - vowelHeight)
    }
    private readonly writeGlides = (glyphs: [Element, Element]) => {

    }
}

// const validateWord = (syllables: string[]) => {
//     if (syllables.every(syllable => Fale.validate(syllable)) === false) return false;
//     if (syllables.every(syllable => Fale.analyze(syllable)) === false) return false;
//     const stressedDist = syllables.map(syllable => Fale.analyze(syllable)?.has("stress") ? 1 : 0) as number[]
//     const stressedSylls = stressedDist.reduce((prev, curr) => prev + curr)
//     if (stressedSylls > 1) return false;
//     const inflectorDist = syllables.map(syllable => Fale.analyze(syllable)?.has("inflector") ? 1 : 0) as number[]
//     const inflectorSylls = inflectorDist.reduce((prev, curr) => prev + curr)
//     if (inflectorSylls > 1) return false;
//     const syllableCats = syllables.map(syllable => Fale.analyze(syllable)) as string[]
//     const inflector = syllableCats.findIndex(syllable => syllable.includes("inflector"))
//     if (inflector !== -1) { if (!syllableCats[inflector - 1]?.includes("closed")) return false; }
//     return true;
// }