import { NodeOAuthClient, buildAtprotoLoopbackClientMetadata, NodeSavedState, NodeSavedSession } from '@atproto/oauth-client-node';
import generateModule from '../helpers/generateModule.mts';

const name = "protoAuth" as const;
const component = generateModule<typeof name, NodeOAuthClient>("protoAuth", (app) => {
    const { redis } = app.context
    const stateDo = (key: string) => `session:${key}`
    const sessionDo = (key: string) => `session:${key}`
    const oauthClient = new NodeOAuthClient({
        clientMetadata: buildAtprotoLoopbackClientMetadata({
            scope: 'atproto email',
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
declare module 'koa' {
    interface DefaultContext {
        [component.name]: Awaited<ReturnType<typeof component.init>>
    }
}
