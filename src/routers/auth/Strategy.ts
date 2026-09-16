import { Middleware } from "koa";
type Method = `${'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options'}:${string}`
export interface Strategy {
    path: string
    methods: {
        [key: Method]: Middleware
    }
}