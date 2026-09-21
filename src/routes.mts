import Router from "@koa/router"
import Koa from 'koa'
import path from "path"
import crawlDir from "./helpers/crawlDir.mts"
import serve from "koa-static"
import Setup from "./interfaces/Setup.mts"

export default {
    name: "routes",
    setup: async (app: Koa) => {
        const router = new Router()
        await crawlDir(path.join(import.meta.dirname, 'routers'), (file: Router) => {
            const routes = file.routes()
            router.use(routes)
        })()
        app
            .use(router.routes())
            .use(serve('./public'))
    }
} satisfies Setup
