import { AuthenticationClientOptions } from "auth0";
import grabEnv from "../helpers/grabEnv.mts";
import { AuthenticationClient } from "auth0";
import generateModule from "../helpers/generateModule.mts";

const name = "auth0"
const component = generateModule<typeof name, AuthenticationClient>(name, () => {
        const { clientId, clientSecret, domain } = grabEnv("auth0") as unknown as AuthenticationClientOptions
        return new AuthenticationClient({
            clientId,
            clientSecret,
            domain
        })})
export default component
declare module 'koa' {
    interface DefaultContext {
        [component.name]: Awaited<ReturnType<typeof component.init>>
    }
}