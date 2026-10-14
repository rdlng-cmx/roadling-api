import { Consonant, Fale, Mark, Vowel } from "./fale.ts"

type Punapa =  `${Exclude<Consonant, "dj"|"tc"|"ts"|"dz">}${Exclude<Vowel, "i">}`
export type Napa = [Punapa, ...Punapa[]]

const napa: Napa = ["ko", "ba"]
const coronals: Consonant[] = ["n", "l", "c", "s", "t", "d"]
const backVowels: Vowel[] = ["o", "u"]
const clippedVowels: Vowel[] = ["e", "u"]
const nasals = ["n", "m"]
interface Transformer {
    validate?: (form: string[]) => boolean
    transform: (form: string[]) => string[]
}
const isUntransformed = (form: string[]) => form.every(syllable => !Fale.marks.includes(syllable[0] as Mark))
const mark = (form: string[], mark: Mark[]) => form.map((syllable, index) => {
    if (Fale.marks.includes(syllable[0] as Mark)) syllable = mark[index] + syllable.slice(1)
    else syllable = mark[index] + syllable
    return syllable
})

export class Kinapa {
    static transformers: {[key: string]: Transformer} = {
        toNeutral: {
            validate: isUntransformed,
            transform: (form) => {
                if (form.length === 1) return mark(form, ["."])
                if (form.length === 2) return mark(form, ["*", "."])
                if (form.length === 3) return mark(form, [".", "*", "."])
                if (form.length === 4) return mark(form, form.map((_syllable, index) => (index === 1 || index === 3) ? "*" : "."))
                return form
            }
        },
        toAccusative: {
            validate: isUntransformed,
            transform: (form) => {
                if (form.length === 1) return mark(form, ["*"])
                if (form.length === 2) return mark(form, [".", "*"])
                if (form.length === 3) return mark(form, ["*", ".", "*"])
                if (form.length === 4) return mark(form, form.map((_syllable, index) => (index === 1 || index === 3) ? "*" : "."))
                return form
            }
        },
        applyStressRules: {
            transform: (form) => {
                const analyzedSyllables = form.map(syllable => Fale.analyze(syllable))
                const closedSyllables = analyzedSyllables.some(attributes => attributes.has("closed"))
                if (closedSyllables) {
                    const stresses = analyzedSyllables.map(attributes => attributes.has("closed") ? "*" : ".")
                    return mark(form, stresses)
                }
                return form
            }
        },
        insertSemiVowels: {
            transform: (form) => {
                const stressedIndices = form.map((syllable, index) => syllable[0] === "*" ? index : null).filter(v => v !== null) as number[]
                for (const index of stressedIndices) {
                    let stressed = form[index]
                    let afterStressed = form[index+1]
                    if (!afterStressed) continue;

                    if (backVowels.includes(afterStressed[2] as Vowel)) form[index] = stressed += "w";
                    if ((afterStressed[2] === "u")
                        || (afterStressed[2] === "e" &&
                        (index === form.length - 2 || nasals.includes(afterStressed[1])))) {
                        const keptConsonant = afterStressed[1]
                        form.splice(index+1, 1)
                        form[index] = stressed += keptConsonant
                        afterStressed = form[index+1]
                    }

                    if (!afterStressed) continue;
                    if (coronals.includes(afterStressed[1] as Consonant)) {
                        const lastPhoneme = stressed[stressed.length-1]
                        if (Fale.consonants.includes(lastPhoneme as Consonant)) form[index] = stressed = `${stressed.slice(0, -1)}y${stressed.slice(-1)}`
                        if (Fale.vowels.includes(lastPhoneme as Vowel)) form[index] = stressed += "y"
                    }
                }
                return form
            }
        }
    } as const;
    constructor(public readonly napa: Napa) {    
    }
    private transformWith = (transformers: (keyof (typeof Kinapa)["transformers"])[]) => () => {
    let form: string[] = this.napa
    for (const key of transformers) {
        const transformer = Kinapa.transformers[key]
        if (transformer.validate) if (!transformer.validate(form)) return null;
        form = transformer.transform(form)
    }
    return form
}
    private _forms = {
        neutral: this.transformWith(["toNeutral", "insertSemiVowels"]),
        accusative: this.transformWith(["toAccusative", "insertSemiVowels", "applyStressRules"])
        
    }
    get forms() {
        const forms: {[key: string]: string[]|null} = {}
        for (const key of Object.keys(this._forms)) {
            forms[key] = this._forms[key as keyof typeof this._forms]()
        }
        return forms
    }
    get neutral() { return this._forms.neutral() }
    get accusative() { return this._forms.accusative() }
}