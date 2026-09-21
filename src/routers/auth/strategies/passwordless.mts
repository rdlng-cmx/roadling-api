import { AuthenticationClient } from "auth0";
import { Strategy } from "../Strategy.ts";
const strategy: Strategy = {
    path: 'passwordless',
    methods: {
        "post:login": async (ctx, next) => {
            const { auth0 } = ctx.components
            const { email } = ctx.request.body as { [key: string]: string }
            ctx.body = await auth0.passwordless.sendEmail({
                email,
                send: "code",
            })
            await next();
        },
        "post:challenge": async (ctx, next) => {
            const { auth0 } = ctx.components
            const { email, code } = ctx.request.body as { [key: string]: string }
            ctx.body = await auth0.passwordless.loginWithEmail({
                email,
                code,
            }).catch(err => console.log(err))
            console.log(ctx.body)
            
            await next();
        }
    }
}

export default strategy