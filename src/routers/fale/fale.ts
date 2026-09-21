const consonants = [
    "p", "b",
    "t", "d",
    "k", "g",
    "m", "n",
    "c", "s",
    "l", "f",
    "h", "x",
    "y", "w",
    "ts", "tc",
    "dz", "dj",
    "r"
] as const;

const glides = [
    "1", "2"
] as const;

const vowels = [
    "a", "e", "i", "o", "u"
] as const;

const marks = [
    ".","*","-"
] as const

type Consonant = typeof consonants[number]
type Glide = typeof glides[number] 
type Vowel = typeof vowels[number]
type Mark = typeof marks[number]

const assert = (any: any) => {
    if (!any) throw new Error();
}
const syllRegEx = new RegExp(`^(?<mark>${marks.map(mark => '\\' + mark).join("|")})(?<onset>${consonants.join("|")})?(?<glide1>${glides.join("|")})?(?<nucleus>${vowels.join("|")})(?<glide2>${glides.join("|")})?(?<coda>${consonants.join("|")})?$`)
console.log(syllRegEx.exec(".tsa"))
type Type = "unstressed"|"stressed"|"inflector"
class Syllable {
    public get structure(): string {
        return parse(this.syllable)
    }
constructor(private syllable: string) {

    }
}

const parse = (syllable:string) => {
    const regex = syllRegEx.exec(syllable)
    if (!regex?.groups) return "";
    const {mark, onset, glide1, nucleus, glide2, coda} = regex?.groups
    const realSyll = [mark, onset, glide1, nucleus, glide2, coda].filter(Boolean).join("|")
    return realSyll
    .split("|")
    .map(char => {
        if (marks.includes(char as Mark)) return char
        if (consonants.includes(char as Consonant)) return "C"
        if (vowels.includes(char as Vowel)) return "V"
        if (glides.includes(char as Glide)) return "G"
        else throw new Error()
    }).join("")
}

const validSyllables = new Map([
    [".CV", "regular"],
    ["-V", "inflector open"],
    ["-VC", "inflector closed"],
    ["*CV", "stressed open"],
    ["*CGV", "stressed open"],
    ["*CVG", "stressed open"],
    ["*CVC", "stressed closed"],
    ["*CGVC", "stressed closed"],
    ["*CVGC", "stressed closed"],
    ["*CGVGC", "stressed closed"],
])

const validateSyllable = (syllable: string) => validSyllables.get(parse(syllable))
console.log(validSyllables.get(parse(".ka")))
const validateWord = (syllables: string[]) => {
        if (syllables.every(syllable => syllRegEx.test(syllable)) === false) return false;
        if (syllables.every(syllable => validateSyllable(syllable)) === false) return false;
        const stressedDist = syllables.map(syllable => validateSyllable(syllable)?.includes("stressed") ? 1 : 0) as number[]
        const stressedSylls = stressedDist.reduce((prev, curr) => prev + curr)
        if (stressedSylls > 1) return false;
        const inflectorDist = syllables.map(syllable => validateSyllable(syllable)?.includes("inflector") ? 1 : 0) as number[]
        const inflectorSylls = inflectorDist.reduce((prev, curr) => prev + curr)
        if (inflectorSylls > 1) return false;
        const syllableCats = syllables.map(syllable => validateSyllable(syllable)) as string[]
        const inflector = syllableCats.findIndex(syllable => syllable.includes("inflector"))
        if (inflector !== -1) { if (!syllableCats[inflector - 1]?.includes("closed")) return false; }
        return true;
    }

class Word extends String {
    constructor(public readonly syllables: string[]) {
        if (!validateWord(syllables)) throw new Error()
        super()
    }
    private get word() {
        return this.syllables.map(syllable => syllable.slice(1)).join("").replaceAll("2", "u").replaceAll("1", "i")
    }
    toString(): string {
        return this.word
    }
    valueOf(): string {
        return this.word
    }
    [Symbol.toPrimitive](): string {
        return this.word
  }
}

type NounForm = "collective" | "distributive" | "immortal" | "indefinite"
type NounCase = "absolutive" | "ergative"
class Lemma {
    constructor() {}
      public readonly forms: Map<string, string> = new Map()
}
class Noun extends Lemma {
    constructor(public readonly syllables: string[]) {
        super()
    }
    declare public forms: Map<NounForm, string>
}

const word = new Word([".hu", "*ma"])

console.log(word)