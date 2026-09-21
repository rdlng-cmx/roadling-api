import fs from "fs"

export default (file: string) => fs.readFileSync(file).toString()