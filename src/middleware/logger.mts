import Koa from 'koa'

const logger: Koa.Middleware = async (ctx: Koa.Context, next) => {
        console.log("𖨆", ctx.method, " => ", ctx.path);
        const { query, body } = ctx
        console.log('   ', body)
        if (query)
        for (const param in query) {
            console.log(`   ${param}: ${query[param]}`)
        }

        await next();
    }

    export default logger