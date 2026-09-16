import { AuthenticationClient } from "auth0";
import { Strategy } from "../Strategy.ts";
const strategy: Strategy = {
    path: 'passwordless',
    methods: {
        "post:login": async (ctx, next) => {
            const client: AuthenticationClient = ctx.auth0
            const { email } = ctx.request.body as { [key: string]: string }
            ctx.body = await client.passwordless.sendEmail({
                email,
                send: "code",
            })
            await next();
        },
        "post:challenge": async (ctx, next) => {
            const client: AuthenticationClient = ctx.auth0
            const { email, code } = ctx.request.body as { [key: string]: string }
            ctx.body = await client.passwordless.loginWithEmail({
                email,
                code,
                
            }, {
                
            }).catch(err => console.log(err))
            
            await next();
        }
    }
}

export default strategy