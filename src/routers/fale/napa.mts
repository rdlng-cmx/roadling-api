import { Consonant, Diacritic, Fale, Mark, Vowel } from "./fale.ts"

type Nanapa = `${Exclude<Consonant, "dj" | "tc" | "ts" | "dz">}${Vowel}`
type TriliteralRadicalEnding = `${Exclude<Consonant, "dj" | "tc" | "ts" | "dz" | "p" | "t" | "k" | "b" | "d" | "g">}e`
export type Napa = [Nanapa] | [Nanapa, Nanapa] | [Nanapa, Nanapa, TriliteralRadicalEnding]

const coronals: Consonant[] = ["n", "c", "s", "t", "d", "r"]
const backVowels: Vowel[] = ["o", "u"]
const clippedVowels = ["e", "u", "i"]
const nasals = ["n", "m", "l"]
interface Transformer {
    validate?: (form: string[]) => boolean
    transform: (form: string[], _this?: Word) => string[]
}
type Kinapa = [Napa | Kinapa | null, Napa | Kinapa | null]
const isUntransformed = (form: string[]) => form.every(syllable => !Fale.marks.includes(syllable[0] as Mark))
const mark = (form: string[], marks: Mark[]) => form.map((syllable, index) => {
    if (Fale.marks.includes(syllable[0] as Mark)) syllable = marks[index] + syllable.slice(1)
    else syllable = marks[index] + syllable
    return syllable
})

export class Word {
    static negotiate = (tuple: [string[], string[]], prefix: boolean = false): string[] => {
        let [first, second] = tuple
        //if there's not a second stem, the first stem passes.
        if (!second) return first;
        //the first syllable of the first stem is always assumed to get stress. if the stem is a prefix, the second stem gets stress
        let stress: number = prefix ? 1 : 0
        //if the second stem is closed or has multiple roots, the first syllable of the second stem gets stress
        const secondStemAnalysis = Fale.analyze(second[0])
        if (secondStemAnalysis.has("closed") || second.length > 1) stress = 1

        if (stress !== 0 || !first.every(syllable => Fale.marks.includes(syllable[0] as Mark))) first = mark(first, [stress === 0 ? "*" : ".", ...Array(first.length - 1).fill(".")])
        second = mark(second, [stress === 1 ? "*" : ".", ...Array(second.length - 1).fill(".")])
        let combinedForm = [...first, ...second]
        combinedForm = Word.transform(combinedForm, "syncopes") as string[]

        return combinedForm
    }
    static print(form: string[] | null) {
        if (!form) return null
        return form.map(syllable => {
            syllable = syllable
            .replaceAll("i", "ï")
            .replaceAll(/(?<=\.\w+)e/g, 'i')
            if (Fale.marks.includes(syllable[0] as Mark)) return syllable.slice(1);
            return syllable }).join("")
            .replaceAll(new RegExp(`(p|t|k|b|d|g)$`, "g"), '$1h')
            .replaceAll(/(?<=[aiïeouwy])(s)(?=[aiïeouwy])/g, "z")
            .replaceAll(/(?<=[aiïeouwy])(c)(?=[aiïeouwy])/g, "j")
            .replaceAll(/(?<=[aiïeouwy])(f)(?=[aiïeouwy])/g, "v")
            .replaceAll(/([aiïeou])\1/g, '$1\u0304')
            .replaceAll(/ïï/g, 'i\u0304')
            .replaceAll("iï", 'eï')

            //replace semi-vowels
    }
    static transform = (form: string[], key: keyof typeof Word.transformers) => {
        const transformer = Word.transformers[key]
        if (transformer.validate) if (!transformer.validate(form)) return null;
        return transformer.transform(form)
    }
    static forStressedIndices = (form: string[], callback: (stress: string, afterStress: string, index: number) => any) => {
        const stressedIndices = form.map((syllable, index) => syllable[0] === "*" ? index : null).filter(v => v !== null) as number[]
        for (const index of stressedIndices) {
            if (!form[index + 1]) continue;
            callback(form[index], form[index + 1], index)
        }
    }
    static transformers: { [key: string]: Transformer } = {
        apocopes: {
            transform: (form) => {
                let firstSyllable = form.at(0)
                let secondSyllable = form.at(1)
                let lastSyllable = form.at(-1)
                let secondToLastSyllable = form.at(-2)
                const firstVowel = Fale.vowels.includes(secondSyllable?.[1] as Vowel) ? secondSyllable?.[1] as string :
                secondSyllable?.[1] === "w" || secondSyllable?.[1] === "y" ? secondSyllable?.[1] as string : firstSyllable?.at(-1) as string
                const lastVowel = lastSyllable?.at(-1)
                const clipReqs = [
                    lastVowel === "e" || (lastVowel === "i" && firstVowel !== "i") || (lastVowel === "u"  && firstVowel !== "u"),
                    Fale.vowels.includes(secondToLastSyllable?.at(-1) as Vowel)||Fale.diacritics.includes(secondToLastSyllable?.at(-1) as Diacritic), 
                    secondToLastSyllable?.[0] === "*" || Fale.vowels.includes(secondToLastSyllable?.[1] as Vowel)]
                if (clipReqs.every(Boolean)) {
                    const consonant = lastSyllable?.[1]
                    form.pop()
                    form[form.length-1] = form.at(-1) as string + consonant
                }
                lastSyllable = form.at(-1)
                const lastY = lastSyllable?.lastIndexOf("y")
                if (
                    lastSyllable
                    && lastY
                    && lastSyllable.at(-2) === "y"
                    && Fale.consonants.includes(lastSyllable.at(-1) as Consonant)
                    && lastVowel === "e") form[form.length - 1] =  lastSyllable.slice(0, lastY) + lastSyllable.slice(lastY + 1)
                return form
            }
        },
        syncopes: {
            transform: (form) => {
                Word.forStressedIndices(form, (stress, afterStress, index) => {
                    const clipReqs = [nasals.includes(afterStress[1]), clippedVowels.includes(afterStress[2]), stress[0] === "*", Fale.vowels.includes(stress.at(-1) as Vowel)]
                    if (clipReqs.every(Boolean)) {
                        form[index] = stress + afterStress.slice(1, 2)
                        form.splice(index + 1, 1)
                    }
                })
                return form
            }
        },
        toAbsolutive: {
            validate: isUntransformed,
            transform: (form) => {
                if (form.length === 1) return mark(form, ["."])
                if (form.length === 2) return mark(form, ["*", "."])
                if (form.length === 3) return mark(form, [".", "*", "."])
                if (form.length >= 4) return mark(form, form.map((_syllable, index) => (index === 1 || index === 3) ? "*" : "."))
                return form
            }
        },
        toErgative: {
            validate: isUntransformed,
            transform: (form) => {
                if (form.length === 1) return mark(form, ["*"])
                if (form.length === 2) return mark(form, [".", "*"])
                if (form.length === 3) return mark(form, ["^", ".", "*"])
                if (form.length >= 4) return mark(form, form.map((_syllable, index) => (index === 1 || index === 3) ? "*" : "."))
                return form
            }
        },
        toSimpleVerb: {
            transform: (form) => {
                Word.forStressedIndices(form, (stressed, afterStressed, index) => {
                    const toGeminate = afterStressed[1]
                
                    // if (toGeminate === "n") form[index+1] = form[index+1].replace("n", "g")
                    // if (toGeminate === "m") form[index+1] = form[index+1].replace("m", "b")
                    // if (toGeminate === "h") form[index+1] = form[index+1].replace("h", "t")
                    form[index] += toGeminate
                })
                return form
            }
        },
        toActiveVoice: {
            transform: (form) => {
                const first = form[0]
                const second = form[1]
                const [mark, consonant, vowel, ending = ""] = first
                const [,, secondVowel] = second
                form[0] = mark + vowel + ending
                form.unshift("." + consonant + (backVowels.includes(secondVowel as Vowel) && vowel !== "u" ? "u" :"e"))
                return form
            }
        },
        toPassiveVoice: {
            transform: (form) => {
                const first = form[0]
                const extension = Fale.vowels.includes(form[1][1] as Vowel) ? form[1][1] : undefined
                
                const vowel = extension ? extension : first[2]
                
                form.unshift("." + vowel)
                return form
            }
        },
        duplicate: {
            transform: (form) => {
                return mark(form.concat(form), ["^",".","*","."])
            }
        },
        toSimpleInfinitive: {
            transform: (form) => {
                const first = form[0]
                const [mark, consonant, vowel] = first
                form[0] = "." + vowel
                form.unshift(mark + consonant + vowel)
                return form
            }
        },
        toPassiveInfinitive: {
            transform: (form) => {
                const first = form[0]
                const [mark, consonant, vowel] = first
                form[0] = "." + vowel
                form.unshift(mark + consonant + vowel)
                return form
            }
        },
        toConstructState: {
            transform: (form) => {
                const last = form.at(-1) as string
                if (Fale.vowels.includes(last.at(-1) as Vowel)) {
                    const vowel = last[2]
                    form.push("." + vowel)
                }
                else {
                    const lastConsonant = last.at(-1) as string
                    const index = form.lastIndexOf(lastConsonant)
                    form[form.length-1] = last.slice(0, index)
                    form.push("-" + last[2] + lastConsonant)
                }
                return form
            },
        },
        toAgent: {
            transform: (form) => {
                const first = form[0]
                const [, consonant, vowel] = first
                form.unshift("." + consonant + vowel)
                return form
            }
        },
        toParticiple: {
            transform: (form) => {
                const _lastSyllable = form.at(-1)
                const lastSyllable = form.lastIndexOf(_lastSyllable as string)
                form[lastSyllable] += "w"
                return form
            }
        },
        glides: {
            transform: (form) => {
                Word.forStressedIndices(form, (stressed, afterStressed, index) => {
                    console.log(form)
                    const position = Fale.consonants.includes(stressed.at(-1) as Consonant) ? stressed.length - (Fale.vowels.includes(stressed[1] as Vowel) ? 1 : 1) : stressed.length 
                    if (!afterStressed) return;
                    const startsWithConsonant = Fale.consonants.includes(stressed[1] as Consonant)
                    const extended = Fale.vowels.includes(afterStressed[1] as Vowel)
                    if (backVowels.includes(afterStressed[2] as Vowel) && startsWithConsonant && stressed[2] !== "u") {
                        form[index] = stressed.slice(0, position) + "w" + stressed.slice(position);
                        return form
                    }
                    if (extended && backVowels.includes(form[index+2]?.[2] as Vowel) && startsWithConsonant && stressed[2] !== "u") {
                        form[index+1] = afterStressed + "w"
                        return form
                    }
                    if (!afterStressed) return;
                    if ((coronals.includes(afterStressed[1] as Consonant) ||(afterStressed[2] === "i" && stressed[2] !== "i")) && startsWithConsonant) {
                        const lastPhoneme = stressed[stressed.length - 1]
                        if (Fale.consonants.includes(lastPhoneme as Consonant)) stressed = stressed = stressed.slice(0, position) + "y" + stressed.slice(position);
                        if (Fale.vowels.includes(lastPhoneme as Vowel)) form[index] = stressed += "y"
                        
                    }
                })
                for (let i in form) {
                    const syllable = form[i]
                    if (Fale.vowels.includes(syllable[1] as Vowel) && syllable[0] === "*") form[i] = syllable.slice(0,1) + (form[+i-1]?.at(-1) === "u" ? "w" : form[+i-1]?.at(-1) === "e" ? "y" : "") + syllable.slice(1)
                    console.log(form[i])
                }
                return form
            }
        },
    } as const;
    constructor(public readonly napa: Napa, protected kinapa: Kinapa | null = null) {

    }
    prefixes: string[] = []
    suffixes: string[] = []
    private transformWith = (transformers: ((keyof (typeof Word)["transformers"] & string)|null|((form: string[]) => string[]))[]) => () => {
        const pause = transformers.findIndex(transformer => transformer === null)
        const preTransformers = pause < 0 ? transformers : transformers.slice(0, pause)
        const postTransformers = pause < 0 ? [] : transformers.slice(pause + 1)
        let napa: string[] = this.napa as string[]
        for (const key of preTransformers) {
            if (!napa) return null;
            if (!key) continue
            if (typeof key === "string") napa = Word.transform(napa, key as string) as string[]
            else napa = key(napa)
        }
        const recursive = (kinapa: any[]) => {
            if (kinapa === null) kinapa = napa
            const [first, second] = [
                !kinapa[0] ? napa :
                    Array.isArray(kinapa[0]) && Array.isArray(kinapa[0][0]) ? recursive(kinapa[0] as string[]) as string[] :
                        kinapa[0],
                Array.isArray(kinapa[1]) && Array.isArray(kinapa[1][0]) ? recursive(kinapa[1] as string[]) as string[] :
                    kinapa[1]
            ] as [string[], string[]]
            return second ? Word.negotiate([first, second]) : [first]
        }
        let word = this.kinapa !== null ? recursive(this.kinapa).flat() : napa
        if (postTransformers) for (const key of postTransformers) {
            if (!word) return null;
            if (!key) continue
            if (typeof key === "string") word = Word.transform(word, key as string) as string[]
            else word = key(napa)
        }
        word = Word.transform(word, "glides") as string[]
        word = Word.transform(word, "apocopes") as string[]
        return word
    }
    private _forms = {
        lemma: () => this.napa,
        /*
        ergative-absolutive alignment is chiefly used in the imperial dialects of the language.
        the templars' simplification of the forms is considered grammatically incorrect in these dialects.
        */
        absolutive: this.transformWith(["toAbsolutive"]),
        ergative: this.transformWith(["toErgative"]),

        /*
        in templar dialects, whatever form had the least syllables became the catch-all form of the word.
        the ergative-absolutive alignment became archaic.
        */
        simplified: () => (this.ergative?.length ?? 0) < (this.absolutive?.length ?? 0) ? this.ergative : this.absolutive,
        /*
        the imperial dialects usually only use the simple verb,
        with the ergativity of the argument indicating active or passive voice.
        sometimes the ergative and absolutive cases of an argument are identical,
        in which case passive and active forms may be used.
        */
        "simple verb": this.transformWith(["toAbsolutive", "toSimpleVerb"]),
        "simple infinitive": this.transformWith(["toAbsolutive", "toSimpleInfinitive"]),

        /*
        active and passive forms are especially relevant in the templar dialects, especially when pronouns are dropped.
        */

        "active/present verb": this.transformWith(["toAbsolutive", "toActiveVoice", "toSimpleVerb"]),
        "passive verb": this.transformWith(["toAbsolutive", "toPassiveVoice", "toSimpleVerb"]),

        "passive infinitive": this.transformWith(["toAbsolutive", "toPassiveVoice"]),
        "active infinitive": this.transformWith(["toAbsolutive", null, "toActiveVoice"]),

        "construct state": this.transformWith(["toErgative", null, "toConstructState"]),
        "agent": this.transformWith(["toAbsolutive", "toAgent"])
    }
    get forms() {
        const forms: { [key: string]: string | null } = {}
        for (const key of Object.keys(this._forms)) {
            forms[key] = Word.print(this._forms[key as keyof typeof this._forms]())
        }
        return forms
    }
    get ergative() { return this._forms.ergative() }
    get absolutive() { return this._forms.absolutive() }
    indefinite = () => this.suffix("ne")
    plural = () => this.suffix("re")
    suffix = (suffix: Nanapa | Napa) => {
        if (this.kinapa) this.kinapa[1] = [this.kinapa[1], (Array.isArray(suffix) ? suffix : [suffix])]
        else this.kinapa = [this.kinapa, (Array.isArray(suffix) ? suffix : [suffix])]
        return this
    }
    prefix = (prefix: Nanapa | Napa) => {
        if (this.kinapa) this.kinapa[1] = [(Array.isArray(prefix) ? prefix : [prefix]), this.kinapa[1]]
        else this.kinapa = [(Array.isArray(prefix) ? prefix : [prefix]), this.kinapa]
        return this
    }
    get = (key: string) => Word.print(this._forms[key as keyof typeof this._forms]())
}
console.log(new Word(["sa", "bu"]).get("active infinitive"))
