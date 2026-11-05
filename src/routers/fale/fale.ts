import { Element } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";

export abstract class Character {
    static glyphs: Element
    public readonly character: G
    public readonly prefix?: string
    protected readonly grab = (glyph: string) => Character.glyphs.find(`#${this.prefix ? this.prefix + "-" : ""}${glyph}`)[0]?.clone().untransform().move(0, 0).addTo(this.character)
    constructor(target: G) {
        this.character = target.group()
    }
}

export type Consonant = typeof Fale.consonants[number]
export type Diacritic = typeof Fale.diacritics[number]
export type Vowel = typeof Fale.vowels[number]
export type Mark = typeof Fale.marks[number]
export type Punctuation = typeof Fale.punctuation[number]

export interface FaleOptions {
    opens?: boolean,
    vowel?: boolean
    flip?: boolean,
    girth?: number,
    spacing?: number,
    alts?: Record<string, string> | string[]
}
interface GlyphData<N extends string> {
    glyph: N | undefined,
}
type Polyglyph<N extends GlyphData<string>> = ReadonlyMap<string, N>

interface ConsonantData extends GlyphData<string> {
    hook: "top" | "bottom" | boolean,
    extend?: [number, number],
    except?: ConsonantExcept[],
    alts?: {
        open?: string
        "hook-top"?: string
        "hook-bottom"?: string
    },
    spacing?: Partial<Record<string, [number, number]>>
}
interface DiacriticData extends GlyphData<`diacritic-${Diacritic}`> {
    space?: [number, number]
}
type ConsonantExcept = Omit<ConsonantData, "glyph" | "alts" | "except"> & { use?: string, glyph: string | "open" }
type FaleType<N extends string, T extends Readonly<GlyphData<string>> = GlyphData<N>> = Record<N, T | Polyglyph<T>>
export interface FaleData {
    consonants: FaleType<Consonant, ConsonantData>
    vowels: FaleType<Vowel>
    diacritics: FaleType<Diacritic, DiacriticData>
    punctuation: FaleType<Punctuation>
}
type HasElement = { element: Element }
type ConsonantGlyph = ConsonantData & HasElement
type VowelGlyph = GlyphData<Vowel> & HasElement
type DiacriticGlyph = DiacriticData & HasElement
type SyllableAttribute = "closed" | "inflector" | "stress" | "invalid" | "punctuation" | "secondary"


export class Fale extends Character {
    static glyphs: Element
    static readonly data: FaleData = {
        consonants: {
            p: new Map([
                ["", {
                    glyph: "p",
                    extend: [
                        0,
                        2
                    ],
                    hook: "top",
                    spacing: {
                        "r": [-1, 0]
                    }
                }]
                , [
                    "old", {
                        glyph: "p-old",
                        extend: [
                            0,
                            2
                        ],
                        hook: "top"
                    }
                ]]),
            b: new Map([
                ["", {
                    glyph: "b",
                    extend: [
                        0,
                        2
                    ],
                    hook: "bottom"
                }],
                ["old", {
                    glyph: "b-old",
                    extend: [
                        0,
                        2
                    ],
                    hook: "bottom"
                }]
            ]),
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
                ]
            },
            k: new Map([
                ["", {
                    glyph: "k",
                    hook: "top",
                    alts: {
                        "hook-bottom": "k-bottom"
                    },
                }],
                ["old", {
                    glyph: "k-bottom",
                    hook: "bottom",
                    alts: {
                        "hook-top": "k",
                        "open": "k"
                    },
                }]
            ]),
            g: new Map([["", {
                glyph: "g",
                hook: "bottom",
                alts: {
                    "hook-top": "g-top"
                },
                except: [
                ],
                spacing: {
                    "k": [-1, -1],
                    "diacritic-1": [0, -1.5]
                }
            }],
            ["old", {
                glyph: "g-top",
                hook: "top",
                alts: {
                    "hook-bottom": "g",
                    "open": "g"
                },
                spacing: {
                    "k": [-1, -1],
                    "diacritic-1": [0, -1.5]
                }
            }]]),
            r: new Map([
                ["", {
                    glyph: "r",
                    hook: true,
                    extend: [
                        4,
                        4
                    ],
                    alts: {
                        open: "r-open",
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
                            ],
                            use: "r-open"
                        },
                        {
                            glyph: "open",
                            hook: "bottom",
                            use: "r-open",
                            extend: [
                                0,
                                0
                            ]
                        }
                    ]
                }],
                ["old", {
                    glyph: "r-old",
                    hook: "bottom",
                    extend: [
                        0,
                        0
                    ],
                    alts: {
                        "hook-top": "r-top",
                        open: "r-open-old"
                    }
                }
                ]]),
            h: new Map([["", {
                glyph: "h",
                hook: "bottom",
                alts: {
                    open: "h-open"
                }
            }], ["old", {
                glyph: "h-old",
                hook: "bottom",
                alts: {
                    open: "h-open-old"
                }
            }]]),
            n: new Map([["", {
                glyph: "n",
                hook: true,
                alts: {
                    open: "n-open"
                },
                except: [
                    {
                        glyph: "k",
                        hook: "bottom"
                    }
                ]
            }], ["old", {
                glyph: "n-old",
                hook: "top",
                alts: {
                    open: "n-open-old"
                }
            }]]),
            x: new Map([["", {
                glyph: "x",
                hook: "top",
                alts: {
                    open: "x-open"
                }
            }], ["old", {
                glyph: "x-old",
                hook: "top",
                alts: {
                    open: "x-open-old"
                }
            }]]),
            c: new Map([
                ["", {
                    glyph: "c",
                    hook: "top",
                    alts: {
                        "open": "c-open"
                    }
                }],
                ["old", {
                    glyph: "c-old",
                    hook: "top",
                    alts: {
                        "open": "c-open-old",
                        "hook-bottom": "c-hook-bottom"
                    }
                }]
            ]),
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
            s: new Map([
                ["", {
                    glyph: "s",
                    hook: true,
                    extend: [
                        2,
                        2
                    ],
                    alts: {
                        open: "s-open"
                    }
                }], ["old", {
                    glyph: "s",
                    hook: true,
                    extend: [
                        2,
                        2
                    ]
                }]
            ]),
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
            f: new Map([
                ["", {
                    glyph: "f",
                    hook: true
                }],
                ["old", {
                    glyph: "f-old",
                    extend: [
                        0, 0
                    ],
                    hook: "bottom",
                    alts: {
                        open: "f-open-old",
                        "hook-top": "f-hook-top"
                    }
                }]
            ]),
            m: new Map([["", {
                glyph: "m",
                hook: true,
                alts: {
                    open: "m-open"
                }
            }], ["old", {
                glyph: "m-old",
                hook: "bottom",
                alts: {
                    open: "m-open-old"
                }
            }]]),
            l: new Map([["", {
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
            }], ["old", {
                glyph: "l-old",
                hook: "top",
                extend: [
                    0, 0
                ],
                alts: {
                    open: "l-open-old",
                    "hook-bottom": "l-bottom"
                },
                except: [
                ]
            }]])
        },
        punctuation: {
            "null": new Map([
                ["", { glyph: "null" }],
                ["old", { glyph: "null-old" }]
            ]),
            "open-bottom": new Map([
                ["", { glyph: "open-bottom" }],
                ["old", { glyph: "open-bottom-old" }]
            ]),
            "open-top": new Map([
                ["", { glyph: "open-top" }],
                ["old", { glyph: "open-top-old" }]
            ]),
            "open-bottom-diacritic-w": new Map([
                ["", { glyph: "open-bottom-diacritic-w" }],
                ["old", { glyph: "open-bottom-diacritic-w-old" }]
            ]),
            "open-top-diacritic-w": new Map([
                ["", { glyph: "open-top-diacritic-w" }],
                ["old", { glyph: "open-top-diacritic-w-old" }]
            ]),
            "open-bottom-diacritic-y": new Map([
                ["", { glyph: "open-bottom-diacritic-y" }],
                ["old", { glyph: "open-bottom-diacritic-y-old" }]
            ]),
            "open-top-diacritic-y": new Map([
                ["", { glyph: "open-top-diacritic-y" }],
                ["old", { glyph: "open-top-diacritic-y-old" }]
            ]),
        },
        diacritics: {
            w: {
                glyph: "diacritic-w",
            },
            y: {
                glyph: "diacritic-y",
            },
            "2": {
                glyph: "diacritic-2",
            },
            "v": {
                glyph: "diacritic-v"
            },
            "0": {
                glyph: "diacritic-0"
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
        "!": new Set(["punctuation"]),
        ".CV": new Set([]),
        ".CGV": new Set([]),
        ".CVG": new Set([]),
        "-V": new Set([]),
        "-GV": new Set([]),
        "-VG": new Set([]),
        "-VC": new Set([]),
        "-GVC": new Set([]),
        "-VGC": new Set([]),
        "*CV": new Set([]),
        "*CGV": new Set([]),
        "*CVG": new Set([]),
        "*CVC": new Set([]),
        "*CGVC": new Set([]),
        "*CVGC": new Set([]),
        "*CGVG": new Set([]),
        "*CGVGC": new Set([])
    }
    static readonly consonants = [
        "p", "b",
        "t", "d",
        "k", "g",
        "m", "n",
        "c", "s",
        "l", "f",
        "h", "x",
        "ts", "tc",
        "dz", "dj",
        "r"
    ] as const;
    static readonly diacritics = [
        "y", "w", "2", "v", "0"
    ] as const;

    static readonly vowels = [
        "a", "e", "i", "o", "u"
    ] as const;

    static readonly marks = [
        ".", "*", "-", "^"
    ] as const;
    static readonly punctuation = [
        "open-top",
        "open-bottom",
        "open-top-diacritic-y",
        "open-bottom-diacritic-y",
        "open-top-diacritic-w",
        "open-bottom-diacritic-w"
    ]
    static readonly validate = (syllable: string) => new RegExp(`^(?<mark>${Fale.marks.map(mark => '\\' + mark).join("|")})(?<onset>${Fale.consonants.join("|")})?(?<diacritic1>${Fale.diacritics.join("|")})?(?<nucleus>${Fale.vowels.join("|")})(?<diacritic2>${Fale.diacritics.join("|")})?(?<coda>${Fale.consonants.join("|")})?$`).exec(syllable)
    static readonly parse = (syllable: string) => {
        const regex = Fale.validate(syllable)
        if (!regex?.groups) return "";
        const { mark, onset, diacritic1, nucleus, diacritic2, coda } = regex?.groups
        const realSyll = [mark, onset, diacritic1, nucleus, diacritic2, coda].filter(Boolean).join("|")
        if (mark === "!") return "!"
        return realSyll
            .split("|")
            .map(char => {
                if (Fale.diacritics.includes(char as Diacritic)) return "G"
                if (Fale.marks.includes(char as Mark)) return char
                if (Fale.consonants.includes(char as Consonant)) return "C"
                if (Fale.vowels.includes(char as Vowel)) return "V"
                else throw new Error()
            }).join("")
    }
    static readonly analyze = (syllable: string) => {
        const parsedSyllable = Fale.parse(syllable)
        const analysis = Fale.validSyllables[parsedSyllable]
        if (!analysis) return new Set(["invalid"])
        if (syllable[0] === "*") analysis.add("stress")
        if (syllable[0] === "^") analysis.add("secondary")
        if (syllable[0] === "-") analysis.add("inflector")
        if (parsedSyllable.slice(-1) === "C") analysis.add("closed")
        return analysis
    }
    private readonly setData = (syllable: string) => {
        const { onset, nucleus, coda, diacritic1, diacritic2 } = Fale.validate(syllable)?.groups! as { onset: Consonant, nucleus: Vowel, coda: Consonant, diacritic1: Diacritic, diacritic2: Diacritic }
        this.diacritics = [diacritic1, diacritic2].map(glyph => {
            if (!glyph) return undefined;
            return { element: this.grab("diacritic-" + glyph), ...this.getData("diacritics", glyph) }
        }) as [DiacriticGlyph | undefined, DiacriticGlyph | undefined]
        this.vowel = { element: this.grab(nucleus), ...this.getData<Vowel>("vowels", nucleus) }
        this.consonants = [onset, coda].map((_glyph, index) => {
            const data = this.getData<Consonant>("consonants", _glyph) as ConsonantData
            if (index === 0) this.onsetAlt = {...data}; else this.codaAlt = {...data}
            console.log("onset", this.onsetAlt)
            if (!_glyph) return undefined;
            const glyph = data.glyph!

            return { element: this.grab(glyph), ...this.getData("consonants", _glyph) }
        }) as [ConsonantGlyph | undefined, ConsonantGlyph | undefined]
    }
    private readonly getData = <N extends string>(prop: keyof typeof Fale["data"], value: N): GlyphData<N> => {
        const dataset = Fale["data"][prop]
        const find = (str: string) => (dataset[value as keyof typeof dataset] as unknown as Polyglyph<GlyphData<N>>).get(str)
        if (dataset[value as keyof typeof dataset] as any instanceof Map) {
            let alt: string | undefined = ""
            const alts = this.options?.alts
            if (Array.isArray(alts)) {
                for (const str of alts) {
                    const validAlt = find(str)
                    if (validAlt) return validAlt
                }
                return find("")!
            }
            else {
                alt = alts?.[value] ?? ""
                const data = find(alt) as GlyphData<N>
                return data
            }
        }

        return dataset[value as keyof typeof dataset]
    }
    private vowel!: VowelGlyph;
    public diacritics: [DiacriticGlyph | undefined, DiacriticGlyph | undefined] = [, ,]
    private consonants: [ConsonantGlyph | undefined, ConsonantGlyph | undefined] = [, ,]
    public get attributes() {
        return Fale.analyze(this._syllable)
    }
    get onset() { return this.consonants[0] }
    get onsetGlyph(): Element { return this.onset!.element }
    set onsetGlyph(glyph: string) {
        const element = this.grab(glyph)
        if (this.onsetAlt) this.onsetAlt.glyph = glyph
        this.onset!.element = this.onset!.element.replace(element)
    }

    get coda() { return this.consonants[1] }
    get codaGlyph(): Element { return this.coda!.element }
    set codaGlyph(glyph: string) {
        const element = this.grab(glyph)
        if (this.codaAlt) this.codaAlt.glyph = glyph
        this.coda!.element = this.coda!.element.replace(element)
    }

    get extension(): [number, number] { const [onset, coda] = this.consonants; return [onset?.extend?.[0] ?? 0, coda?.extend?.[1] ?? 0] }
    onsetAlt?: ConsonantData
    codaAlt?: ConsonantData

    // constructor
    constructor(target: G, private _syllable: string, public readonly options: FaleOptions = {
        flip: false,
        opens: true,
        girth: 1
    }) {

        super(target)

        const { attributes } = this
        if (attributes.has("invalid")) return;
        const showVowel = options.vowel ?? (attributes.has("stress") || attributes.has("inflector"))
        this.setData(_syllable)
        console.log("set onset", this.onsetAlt)

        const { writeOpenInflector, writeClosedInflector, writeClosedSyllable, writeStressedOpenSyllable, writeOpenSyllable, writeVowel, writeDiacritics } = this
        if (attributes.has("inflector")) if (attributes.has("closed")) writeClosedInflector(); else;
        else if (attributes.has("closed")) writeClosedSyllable();
        else if (attributes.has("stress")) writeStressedOpenSyllable();
        else writeOpenSyllable();
        const [onset, coda] = this.consonants

        if (onset?.element) writeDiacritics([onset.element, coda?.element]); else if (coda?.element) writeDiacritics([coda.element]);
        const head: Element = onset?.element ?? coda?.element ?? writeOpenInflector();
        writeVowel(head, showVowel, !!coda)
    }

    //writing methods
    private readonly writeOpenInflector = () => {
        const nullData = this.getData("punctuation", "null")
        const nullGlyph = this.grab(nullData.glyph!)
        if (this.options.flip) nullGlyph.flip('x')
        this.writeDiacritics([nullGlyph])
        return nullGlyph
    }
    private readonly writeClosedInflector = () => {
        const { hook, element } = this.coda!
        const y = (hook === "top") ? "top" : "bottom"
        const [diacritic1] = this.diacritics
        diacritic1?.element.remove()
        let diacriticOpen = diacritic1 ? "-" + diacritic1.glyph : ""
        const punctuationName = "open-" + y + diacriticOpen
        const open = this.grab(this.getData("punctuation", punctuationName).glyph ?? punctuationName)
        element.move(open.bbox().width, y === "top" ? 0 : open.bbox().height - element.bbox().height).flip('x')
        this.writeExtension([open, element], y)
    }
    private readonly writeClosedSyllable = () => {
        const [onset, coda] = this.consonants

        if (!onset || !coda) return;
        const space = this.onsetGlyph.bbox().width + 2
        const except = onset.except?.find(data => data.glyph === coda.glyph)
        const extension: [number, number] = (except as unknown as {
            extend?: [number, number]
        })?.extend ?? this.extension
        if (except?.use) this.onsetGlyph = except.use

        const goBy = except ?? onset
        let hook: "top" | "bottom" | false = goBy.hook === true ? coda?.hook === true ? "top" : coda?.hook : goBy.hook === false ? false : goBy.hook

        const conflict = typeof coda.hook === "string" && hook !== coda.hook
        console.log("conflict", conflict)
        if (conflict) {
            const codaHookAlt = "hook-" + hook as "hook-top" | "hook-bottom"
            const onsetHookAlt = "hook-" + coda.hook as "hook-top" | "hook-bottom"
            if (coda.alts?.[codaHookAlt]) {
                this.codaGlyph = coda.alts[codaHookAlt]
            }
            else if (onset.alts?.[onsetHookAlt]) {
                this.onsetGlyph = onset.alts[onsetHookAlt]
                hook = coda.hook as "top" | "bottom"
            }
        }


        this.codaGlyph.move(space, 0).flip('x')

        if (hook) {

            this.writeExtension([this.onsetGlyph, this.codaGlyph], hook, extension)
        }
    }

    private readonly writeStressedOpenSyllable = () => {
        if (!this.options.opens) return this.writeOpenSyllable();
        const onset = this.consonants[0]!
        const { element, hook, except } = onset
        const exceptOpen = except?.find(data => data.glyph === "open")
        if (exceptOpen && exceptOpen.use) this.onsetGlyph = exceptOpen.use
        if (!hook) return;
        const y = (hook === true ? "bottom" : hook)
        const [_, diacritic2] = this.diacritics
        const diacriticHasHook = diacritic2?.glyph === "diacritic-y" || diacritic2?.glyph === "diacritic-w"
        if (diacriticHasHook) diacritic2?.element.remove()
        let diacriticOpen = diacritic2 && diacriticHasHook ? "-" + diacritic2.glyph : ""
        const punctuationName = "open-" + y + diacriticOpen
        console.log(this.getData("punctuation", punctuationName))
        const open = this.grab(this.getData("punctuation", punctuationName).glyph ?? punctuationName)
        open.move(element.bbox().width, hook === "top" ? 0 : element.bbox().height - open.bbox().height).flip('x')
        this.writeExtension([onset.element, open], y, exceptOpen?.extend ?? this.extension)
    }
    private readonly writeOpenSyllable = () => {
        const onset = this.consonants[0]!
        if (onset.alts?.open) this.onsetGlyph = onset.alts.open
        if (this.options.flip) this.onsetGlyph.flip('x')
    }
    private readonly writeExtension = (elements: [Element, Element], y: "top" | "bottom" = "top", extension: [number, number] = this.extension) => {
        const { y: closingGlyphY, y2: closingGlyphY2 } = this.character.bbox()
        const { x: closingGlyphX, width: closingWidth } = elements[1].bbox()
        const { x2: openingX2, width: openingWidth } = elements[0].bbox()
        const lineY = y === "bottom" ? closingGlyphY2 : closingGlyphY
        const calculate = (n: number, m: number) => n === 4 ? m : n * (m / 4)
        this.character.line(openingX2 - calculate(extension[0], openingWidth), lineY, closingGlyphX + calculate(extension[1], closingWidth), lineY)
    }
    private readonly writeVowel = (glyph: Element, show: boolean, coda: boolean) => {
        if (!show) return this.vowel.element?.remove()
        const { girth = 1, spacing = 0.5 } = this.options
        const vowel = this.vowel.element
        if (!vowel) return;
        const { width: glyphWidth, x: glyphX, y: glyphY } = glyph.bbox()
        const { width: vowelWidth, height: vowelHeight } = vowel.bbox()
        vowel.move(glyphX + glyphWidth / 2 - vowelWidth / 2 + (glyphWidth < 3 && !coda ? 1 : 0), glyphY - (girth + spacing) - vowelHeight)
    }
    private readonly writeDiacritics = (glyphs: [Element, Element?]) => {
        const [onset, coda = onset] = glyphs
        const { x: onsetX, y: onsetY } = onset.bbox()
        const { x2: codaX2, y: codaY } = coda.bbox()
        const [diacritic1, diacritic2] = this.diacritics
        const defaultSpace = [(this.options.girth ?? 1) / 2, 0]
        const space1 = diacritic1?.space ?? defaultSpace
        const space2 = diacritic2?.space ?? defaultSpace
        const customSpacing1 = (
            this.onsetAlt?.spacing?.["diacritic-1"]?.[this.options.flip ? 1 : 0]) ?? 0
        console.log(customSpacing1)
        diacritic1?.element.move(onsetX - space1[0] - diacritic1.element.bbox().width - (this.options.girth ?? 0) - customSpacing1, onsetY - space1[1])
        diacritic2?.element.move(codaX2 + space2[0] + (this.options.girth ?? 0), codaY - space2[1]).flip('x')
    }
}

export class Moja extends Character {
    static data = {
        "loa2": {
            spacing: [4, 4]
        },
        "connector": {
            spacing: [0.5, 0.5]
        },
        "construct": {
            spacing: [1, 1]
        }
    }
    prefix = "moja"
    static validate = (syllable: string) => /!(?<moja>.+)/.exec(syllable)
    public get name() { return this._moja.slice(1) as keyof typeof Moja.data }
    constructor(target: G, private _moja: string) {
        super(target)
        const groups = Moja.validate(_moja)?.groups
        if (!groups || !groups.moja) return;
        if (groups.moja === "space") this.space()
        else this.grab(groups.moja)
    }
    space = () => {
        this.character.rect(2, 0)
    }
}

export class Dan extends Character {
    get marks() {
        const marks = []
        const { places } = this
        for (const i in places) {
            marks.push(this.places[i].split("")
            .map((digit, j) =>
                parseInt(digit) === 0 ? null : 
                j === 0 ? "place-100" :
                j === 1 ? "place-10" :
                parseInt(i) !== 0 ? "place-1000" :
                "place-1")
        )
        }
        return marks
    }
    get value() {
        return this.places.map((digit, index) => parseInt(digit) * (1000 ** index)).reduce((i,j) => i+j)
    }
    get places() {
        const dan = this._dan.slice(1)
        const toArray = dan.toString().split('').reverse()
        for (const index in toArray) {
            if (parseInt(index) % 3 === 2) toArray[index] += ","
        }
        console.log(toArray.join(""))
       return toArray.join("").split(",").map(place => place.split("").reverse().join("")).filter(Boolean).map(place =>  place.padStart(3, "0"))
    }
    prefix = "dan"
    static validate = (syllable: string) => /#(?<dan>[1-7]+)/.exec(syllable)
    constructor(target: G, private _dan: `${number}`,) {
        super(target)
        const groups = Dan.validate(_dan)?.groups
        console.log(this.places)
        console.log(this.value)
        console.log(this.marks)
        if (!groups || !groups.dan) return;
        this.grab(groups.dan)
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