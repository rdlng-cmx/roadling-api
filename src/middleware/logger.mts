import Koa from 'koa'

const logger: Koa.Middleware = async (ctx: Koa.Context, next) => {
        console.log("𖨆", ctx.method, " => ", ctx.path);
        const { query } = ctx
        const { body } = ctx.request
        if (body) console.log('   ', body)
        if (query)
        for (const param in query) {
            console.log(`   ${param}: ${query[param]}`)
        }

        await next();
        console.log('   status: ' + ctx.response.status)
    }

    export default logger