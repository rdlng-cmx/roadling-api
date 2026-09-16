import { NodeOAuthClient } from "@atproto/oauth-client-node"
import { Strategy } from "../Strategy.ts"

const strategy: Strategy = {
    path: "proto",
    methods: {
        "post:login": async (ctx, next) => {
            const { handle } = ctx.request.body as { [key: string]: string }
            if (handle) {
                const url = ctx.request.origin
                console.log(url)
                const authUrl = await protoAuth.authorize(handle, { state: url, scope: 'atproto' })
                ctx.body = { redirectUrl: authUrl.toString() }
            }
            next();
        },
        "get:callback": async (ctx, next) => {
            const params = new URLSearchParams(ctx.querystring)
            const protoAuth: NodeOAuthClient = ctx.protoAuth
            console.log()
            const { session, state } = await protoAuth.callback(params);
            ctx.cookies.set("did", session.did, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/'
            });
            ctx.redirect('/yippee.html?get=' + state)
            await next();
        }
    }
}
export default strategy