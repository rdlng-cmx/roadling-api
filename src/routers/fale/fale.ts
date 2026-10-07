import { Element } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";

type Consonant = typeof Fale.consonants[number]
type Diacritic = typeof Fale.diacritics[number]
type Vowel = typeof Fale.vowels[number]
type Mark = typeof Fale.marks[number]
type Punctuation = typeof Fale.punctuation[number]

export interface FaleOptions {
    opens?: boolean,
    vowel?: boolean
    flip?: boolean,
    girth?: number,
    alts?: Record<string, string>|string[]
}
interface GlyphData<N extends string> {
    glyph: N | undefined,
}
type Polyglyph<N extends GlyphData<string>> = Map<string, N> 

interface ConsonantData extends GlyphData<string> {
    hook: "top" | "bottom" | boolean,
    extend?: [number, number],
    except?: ConsonantExcept[],
    alts?: {
        open?: string
        "hook-top"?: string
        "hook-bottom"?: string
    }
}
interface DiacriticData extends GlyphData<`diacritic-${Diacritic}`> {
    space?: [number, number]
}
type ConsonantExcept = Omit<ConsonantData, "glyph" | "alts" | "except"> & { use?: string, glyph: string | "open" }
type FaleType<N extends string, T extends GlyphData<string> = GlyphData<N>> = Record<N, T|Polyglyph<T>>
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
type SyllableAttribute = "closed" | "inflector" | "stress" | "invalid" | "punctuation"

export abstract class Character {
    static glyphs: Element
    public readonly character: G
    public readonly prefix?: string
    protected readonly grab = (glyph: string) => Character.glyphs.find(`#${this.prefix ? this.prefix + "-" : ""}${glyph}`)[0]?.clone().untransform().move(0, 0).addTo(this.character)
    constructor(target: G) {
        this.character = target.group()
    }
}
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
                hook: "top"
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
                ]
            },
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
                    open: "l-open-old"
                },
                except: [
                ]
            }]])
        },
        punctuation: {
            "open-bottom": { glyph: "open-bottom" },
            "open-top": { glyph: "open-top" },
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
            "x": {
                glyph: "diacritic-x",
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
        "-V": new Set(["inflector",]),
        "-GV": new Set(["inflector",]),
        "-VG": new Set(["inflector",]),
        "-VC": new Set(["inflector", "closed"]),
        "-GVC": new Set(["inflector", "closed"]),
        "-VGC": new Set(["inflector", "closed"]),
        "*CV": new Set(["stress",]),
        "*CGV": new Set(["stress",]),
        "*CVG": new Set(["stress",]),
        "*CVC": new Set(["stress", "closed"]),
        "*CGVC": new Set(["stress", "closed"]),
        "*CVGC": new Set(["stress", "closed"]),
        "*CGVG": new Set(["stress"]),
        "*CGVGC": new Set(["stress", "closed"])
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
    static readonly diacritics = [
        "y", "w", "2", "v", "0", "x"
    ] as const;

    static readonly vowels = [
        "a", "e", "i", "o", "u"
    ] as const;

    static readonly marks = [
        ".", "*", "-",
    ] as const;
    static readonly punctuation = [
        "open-top",
        "open-bottom",
        "open-top-y",
        "open-bottom-y",
        "open-top-w",
        "open-bottom-w"
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
    static readonly analyze = (syllable: string) => Fale.validSyllables[Fale.parse(syllable)] ?? new Set(["invalid"])
    private readonly setData = (syllable: string) => {
        const { onset, nucleus, coda, diacritic1, diacritic2 } = Fale.validate(syllable)?.groups! as { onset: Consonant, nucleus: Vowel, coda: Consonant, diacritic1: Diacritic, diacritic2: Diacritic }
        this.diacritics = [diacritic1, diacritic2].map(glyph => {
            if (!glyph) return undefined;
            return { element: this.grab("diacritic-" + glyph), ...this.getData("diacritics", glyph) }
        }) as [DiacriticGlyph | undefined, DiacriticGlyph | undefined]
        this.vowel = { element: this.grab(nucleus), ...this.getData<Vowel>("vowels", nucleus)}
        this.consonants = [onset, coda].map(_glyph => {
            if (!_glyph) return undefined;
            const glyph = this.getData<Consonant>("consonants", _glyph).glyph!
            console.log(glyph)
            return { element: this.grab(glyph), ...this.getData("consonants", _glyph) }
        }) as [ConsonantGlyph | undefined, ConsonantGlyph | undefined]
    }
    private readonly getData = <N extends string>(prop: keyof typeof Fale["data"], value: N): GlyphData<N> => {
        const dataset = Fale["data"][prop]
        const find = (str: string) => (dataset[value as keyof typeof dataset] as unknown as Polyglyph<GlyphData<N>>).get(str)
        if (dataset[value as keyof typeof dataset] as any instanceof Map) {
            let alt: string|undefined = ""
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
    get onsetGlyph() { return this.onset!.element }
    set onsetGlyph(element: Element) { this.onset!.element = this.onset!.element.replace(element) }

    get coda() { return this.consonants[1] }
    get codaGlyph() { return this.coda!.element }
    set codaGlyph(element: Element) { this.coda!.element = this.coda!.element.replace(element) }

    get extension(): [number, number] { const [onset, coda] = this.consonants; return [onset?.extend?.[0] ?? 0, coda?.extend?.[1] ?? 0] }


    // constructor
    constructor(target: G, private _syllable: string, private options: FaleOptions = {
        flip: false,
        opens: true,
        girth: 1
    }) {
        super(target)
        const { attributes } = this
        if (attributes.has("invalid")) return;
        const showVowel = options.vowel ?? (attributes.has("stress") || attributes.has("inflector"))
        this.setData(_syllable)

        const { writeOpenInflector, writeClosedInflector, writeClosedSyllable, writeStressedOpenSyllable, writeOpenSyllable, writeVowel, writeDiacritics } = this
        if (attributes.has("inflector")) if (attributes.has("closed")) writeClosedInflector(); else;
        else if (attributes.has("closed")) writeClosedSyllable();
        else if (attributes.has("stress")) writeStressedOpenSyllable();
        else writeOpenSyllable();
        const [onset, coda] = this.consonants

        if (onset?.element) writeDiacritics([onset.element, coda?.element]); else if (coda?.element) writeDiacritics([coda.element]);
        const head: Element = onset?.element ?? coda?.element ?? writeOpenInflector();
        writeVowel(head, showVowel)
    }

    //writing methods
    private readonly writeOpenInflector = () => {
        const nullGlyph = this.grab("null")
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
        const open = this.grab("open-" + y + diacriticOpen)
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
        if (except?.use) this.onsetGlyph = this.grab(except.use)

        const goBy = except ?? onset
        console.log(goBy)
        let hook: "top" | "bottom" | false = goBy.hook === true ? coda?.hook === true ? "top" : coda?.hook : goBy.hook === false ? false : goBy.hook

        const conflict = typeof onset.hook === "string" && typeof coda.hook === "string" && onset.hook !== coda.hook
        console.log(conflict)
        if (conflict) {
            const codaHookAlt = "hook-" + onset.hook as "hook-top" | "hook-bottom"
            const onsetHookAlt = "hook-" + coda.hook as "hook-top" | "hook-bottom"
            if (coda.alts?.[codaHookAlt]) {
                this.codaGlyph = this.grab(coda.alts[codaHookAlt])
                hook = onset.hook as "top" | "bottom"
            }
            else if (onset.alts?.[onsetHookAlt]) {
                this.onsetGlyph = this.grab(onset.alts[onsetHookAlt])
                hook = coda.hook as "top" | "bottom"
            }
        }


        this.codaGlyph.move(space, 0).flip('x')

        console.log(hook)
        if (hook) {

            this.writeExtension([this.onsetGlyph, this.codaGlyph], hook, extension)
        }
    }

    private readonly writeStressedOpenSyllable = () => {
        if (this.options.opens) return this.writeOpenSyllable();
        const onset = this.consonants[0]!
        const { element, hook, except } = onset
        const exceptOpen = except?.find(data => data.glyph === "open")
        if (exceptOpen && exceptOpen.use) this.onsetGlyph = this.grab(exceptOpen.use)
        if (!hook) return;
        const y = (hook === true ? "bottom" : hook)
        const [_, diacritic2] = this.diacritics
        const diacriticHasHook = diacritic2?.glyph === "diacritic-y"||diacritic2?.glyph === "diacritic-w"
        if (diacriticHasHook) diacritic2?.element.remove()
        let diacriticOpen = diacritic2 && diacriticHasHook ? "-" + diacritic2.glyph : ""
        const open = this.grab("open-" + y + diacriticOpen)
        open.move(element.bbox().width, hook === "top" ? 0 : element.bbox().height - open.bbox().height).flip('x')
        this.writeExtension([onset.element, open], y, exceptOpen?.extend ?? this.extension)
    }
    private readonly writeOpenSyllable = () => {
        const onset = this.consonants[0]!
        if (onset.alts?.open) this.onsetGlyph = this.grab(onset.alts.open)
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
    private readonly writeVowel = (glyph: Element, show: boolean) => {
        if (!show) return this.vowel.element?.remove()
        const { girth = 1 } = this.options
        const vowel = this.vowel.element
        if (!vowel) return;
        const { width: glyphWidth, x: glyphX, y: glyphY } = glyph.bbox()
        const { width: vowelWidth, height: vowelHeight } = vowel.bbox()
        vowel.move(glyphX + glyphWidth / 2 - vowelWidth / 2, glyphY - (girth + .5) - vowelHeight)
    }
    private readonly writeDiacritics = (glyphs: [Element, Element?]) => {
        const [onset, coda = onset] = glyphs
        const { x: onsetX, y: onsetY } = onset.bbox()
        const { x2: codaX2, y: codaY } = coda.bbox()
        const [diacritic1, diacritic2] = this.diacritics
        const defaultSpace = [(this.options.girth ?? 1)/2,0]
        const space1 = diacritic1?.space ?? defaultSpace
        const space2 = diacritic2?.space ?? defaultSpace
        diacritic1?.element.move(onsetX - space1[0] - diacritic1.element.bbox().width - (this.options.girth ?? 0), onsetY - space1[1])
        diacritic2?.element.move(codaX2 + space2[0] + (this.options.girth ?? 0), codaY - space2[1]).flip('x')
    }
}

export class Moja extends Character {
    prefix = "moja"
    static validate = (syllable: string) => /!(?<moja>.+)/.exec(syllable)
    constructor(target: G, _moja: string) {
        super(target)
        const groups = Moja.validate(_moja)?.groups
        if (!groups || !groups.moja) return; 
        this.grab(groups.moja)
    }
}
export class Dan extends Character {
    prefix = "dan"
    static validate = (syllable: string) => /#(?<dan>[1-7]+)/.exec(syllable)
    constructor(target: G, _dan: string) {
        super(target)
        const groups = Dan.validate(_dan)?.groups
        console.log(groups)
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