import path from "path";
import { pathToFileURL } from "url";
import fs from 'node:fs'

export default (dir: string, callback: (arg?: any) => any) => async function () {
    console.log("crawling directory: " + dir)
    const extension = import.meta.filename.split(".").pop() === 'mts' ? '.mts' : '.mjs'
    const routersPath = dir;
    const routerFiles = fs.readdirSync(routersPath).map(content => {
        if (content.endsWith(extension)) {
            return !content.includes('index') ? content : undefined
        }
        const folder = fs.readdirSync(routersPath + "/" + content)
        if (folder.some(file => file === ("index" + extension))) return content + "/index" + extension
        else return undefined
    }).filter(Boolean) as string[];
    for (const file of routerFiles) {
        const filePath = path.join(routersPath, file);
        console.log("   found " + file)
        const stuff = ((await import(pathToFileURL(filePath).href)).default)
        callback(stuff)
    }
}