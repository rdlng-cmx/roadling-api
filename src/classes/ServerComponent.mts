import Koa from 'koa'
export abstract class ServerModule<const N extends string, T> {
    constructor(public readonly name: N, public readonly init: (app: Koa) => T|Promise<T>) {
        this.hook = async (app: Koa) => {
            const component = await this.init(app)
            //@ts-ignore
            app.context.components[name]  = component
            return app as Koa & {
        context: {
            components: Record<N, T>}
    }
        }
    }
    public hook: (app: Koa) => Promise<Koa &  {
        context: {
            components: Record<N, T>
        }
    }>
}

