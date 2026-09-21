import { ServerModule } from "../classes/ServerComponent.mts"

export default <const N extends string, T>(...args: ConstructorParameters<typeof ServerModule<N, T>>) => {
    const [name, init] = args
    const _module = class extends ServerModule<typeof name, ReturnType<typeof init>> {}
    return new _module(name, init)
}