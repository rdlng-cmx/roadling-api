export const consonants = [
    "p", "b",
    "t", "d",
    "k", "g",
    "m", "n",
    "c", "s",
    "l", "f",
    "h", "hr",
    "y",
    "ts", "tc",
    "dz", "dj",
    "r"
] as const;
export type Consonant = typeof consonants[number]

export const glides = [
    "1", "2"
] as const;
export type Glide = typeof glides[number]

export const vowels = [
    "a", "e", "i", "o", "u"
] as const;
export type Vowel = typeof vowels[number]

export const marks = [
    ".","*","-", " "
] as const
export type Mark = typeof marks[number]

export const structure = RegExp(`^(?<mark>${marks.map(mark => '\\' + mark).join("|")})(?<onset>${consonants.join("|")})?(?<glide1>${glides.join("|")})?(?<nucleus>${vowels.join("|")})(?<glide2>${glides.join("|")})?(?<coda>${consonants.join("|")})?$`)
export const parse = (syllable:string) => {
    const regex = structure.exec(syllable)

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

export const validateSyllable = (syllable: string) => validSyllables.get(parse(syllable))