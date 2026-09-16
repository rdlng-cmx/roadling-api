import { NodeOAuthClient } from "@atproto/oauth-client-node"
import Router from "@koa/router"
import Path from "path";
import { pathToFileURL } from "url";
import fs from 'node:fs'
import { Strategy } from "./Strategy.ts";

async function getAuths(router: Router) {
    const extension = import.meta.filename.split(".").pop() === 'mts' ? '.mts' : '.mjs'
    const strategiesPath = Path.join(import.meta.dirname, 'strategies');
    const routerFiles = fs.readdirSync(strategiesPath).map(content => {
        if (content.endsWith(extension)) {
            console.log(content)
            return content
        }
        const folder = fs.readdirSync(strategiesPath + "/" + content)
        if (folder.some(file => file === ("index" + extension))) return content + "/index" + extension
        else return undefined
    }).filter(Boolean) as string[];

    for (const file of routerFiles) {
        const filePath = Path.join(strategiesPath, file);
        const { path, methods} = ((await import(pathToFileURL(filePath).href)).default as Strategy)
        const strategyRouter = new Router()
        strategyRouter.prefix(`/${path}`)
        for (const [key, handler] of Object.entries(methods)) {
            const [method, route] = key.split(':')
            if (typeof strategyRouter[method] === 'function') strategyRouter[method]('/' + route, handler)
        }
        console.log(strategyRouter)
        router.use(strategyRouter.routes())
    }
}

const router = new Router()
await getAuths(router)

export default router