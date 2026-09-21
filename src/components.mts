import auth0 from './components/auth0.mts'
import protoAuth from './components/protoAuth.mts'
import redis from './components/redis.mts'
import s3 from './components/s3.mts'
import Koa from 'koa'
import Setup from './interfaces/Setup.mts'

const components = [auth0, redis, s3, protoAuth]
export default {
    name: "components",
    setup: async (app: Koa) => {
        //@ts-ignore
        app.context.components = {}
        for (const component of components) {
            console.log("   hooking " +  component.name)
            await component.hook(app)
        }
        console.log(Object.keys(app.context.components))
    }
} satisfies Setup

declare module 'koa' {
    interface DefaultContext {
        components: {
            auth0: Awaited<ReturnType<typeof auth0.init>>
            redis: Awaited<ReturnType<typeof redis.init>>
            s3: Awaited<ReturnType<typeof s3.init>>
            protoAuth: Awaited<ReturnType<typeof protoAuth.init>>
        }
    }
}
