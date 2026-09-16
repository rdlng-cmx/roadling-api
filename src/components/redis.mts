import { createClient, RedisClientOptions, RedisClientType } from 'redis';
import { ServerModule } from '../interfaces/ServerComponent.mts';
import generateModule from '../helpers/generateModule.mts';
import grabEnv from '../helpers/grabEnv.mts';

const name = "redis" as const
const component = generateModule<typeof name, RedisClientType>(name, async () => {
    const { username, password, host, port } = grabEnv("redis")
    const redis = createClient({
        username,
        password,
        socket: {
            host: host,
            port: +(port as string)
        }
    });
    await redis.connect()
    return redis
})
export default component
declare module 'koa' {
    interface DefaultContext {
        [component.name]: Awaited<ReturnType<typeof component.init>>
    }
}