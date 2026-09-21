import { NodeOAuthClient, buildAtprotoLoopbackClientMetadata, NodeSavedState, NodeSavedSession, RuntimeLock } from '@atproto/oauth-client-node';
import generateModule from '../helpers/generateComponent.mts';
import Redlock from 'redlock';
const name = "protoAuth" as const;
const scope = "atproto transition:email"
const component = generateModule<typeof name, NodeOAuthClient>(name, (app) => {
    const { redis } = app.context.components
    const redlock = new Redlock([redis as any])

    const requestLock: RuntimeLock = async (key, fn) => {
        const lock = await redlock.lock(key, 45e3)
        try {
            return await fn()
        } finally {
            await redlock.unlock(lock)
        }
    }

    const stateDo = (key: string) => `session:${key}`
    const sessionDo = (key: string) => `session:${key}`
    const oauthClient = new NodeOAuthClient({
        requestLock,
        clientMetadata: buildAtprotoLoopbackClientMetadata({
            scope,
            redirect_uris: ['http://127.0.0.1:3000/proto/callback'],
        }),
        stateStore: {
            async get(key: string) { return await redis.json.get(stateDo(key)) as unknown as Promise<NodeSavedState> },
            async set(key: string, value: NodeSavedState) { await redis.json.set(stateDo(key), '$', value) },
            async del(key: string) { await redis.json.del(stateDo(key)) },
        },
        sessionStore: {
            async get(key: string) { return await redis.json.get(sessionDo(key)) as unknown as Promise<NodeSavedSession> },
            async set(key: string, value: NodeSavedSession) { await redis.json.set(sessionDo(key), '$', value) },
            async del(key: string) { await redis.json.del(sessionDo(key)) },
        },
    })
    return oauthClient
})
export default component
