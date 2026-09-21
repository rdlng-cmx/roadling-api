import { NodeOAuthClient } from "@atproto/oauth-client-node"
import Router from "@koa/router"
import Path from "path";
import { pathToFileURL } from "url";
import fs from 'node:fs'
import { Strategy } from "./Strategy.ts";
import crawlDir from "../../helpers/crawlDir.mts";
import path from "node:path";

async function strategies() {
    const router = new Router()
    await crawlDir(path.join(import.meta.dirname, "strategies"), (strategy: Strategy) => {
        const {path, methods} = strategy
        const strategyRouter = new Router()
        strategyRouter.prefix(`/${path}`)
        for (const [key, handler] of Object.entries(methods)) {
            const [method, route] = key.split(':')
            if (typeof strategyRouter[method] === 'function') strategyRouter[method]('/' + route, handler)
        }
        router.use(strategyRouter.routes())
    })()
    return router
}

export default await strategies()