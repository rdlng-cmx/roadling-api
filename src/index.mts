import 'dotenv/config'

import Koa from 'koa'
import Router from '@koa/router'
import mongoose from 'mongoose'
import dns from 'node:dns/promises';
import fs from 'node:fs'
import path from 'node:path'
import cors from '@koa/cors'
import serve from 'koa-static'
import { pathToFileURL } from 'node:url';
import { S3Client } from '@aws-sdk/client-s3';
import logger from './middleware/logger.mts';
import { bodyParser } from '@koa/bodyparser';
import { createClient } from 'redis';
import { NodeOAuthClient, buildAtprotoLoopbackClientMetadata, NodeSavedState, NodeSavedSession } from '@atproto/oauth-client-node';

export const app = new Koa();

const { REDIS_USER, REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } = process.env
const redis = createClient({
    username: REDIS_USER,
    password: REDIS_PASSWORD,
    socket: {
        host: REDIS_HOST,
        port: +(REDIS_PORT as string)
    }
});
await redis.connect();
app.context.redis = redis

function protoAuth() {
    const stateDo = (key: string) => `session:${key}`
    const sessionDo = (key: string) => `session:${key}`
    const oauthClient = new NodeOAuthClient({
        clientMetadata: buildAtprotoLoopbackClientMetadata({
            scope: 'atproto',
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
}
app.context.protoAuth = protoAuth()
const { AMAZON_S3_BUCKET_REGION, AMAZON_S3_ACCESS_KEY, AMAZON_S3_SECRET_ACCESS_KEY } = process.env
const s3 = new S3Client({
    credentials: {
        accessKeyId: AMAZON_S3_ACCESS_KEY as string,
        secretAccessKey: AMAZON_S3_SECRET_ACCESS_KEY as string
    },
    region: AMAZON_S3_BUCKET_REGION as string
})

async function mongo() {
    const { MONGO_CONNECT } = process.env
    if (MONGO_CONNECT) await mongoose.connect(MONGO_CONNECT)
}
await mongo()

app.use(cors())

app.context.s3 = s3
export const router = new Router()


async function getRouters() {
    const extension = import.meta.filename.split(".").pop() === 'mts' ? '.mts' : '.mjs'
    const routersPath = path.join(import.meta.dirname, 'routers');
    const routerFiles = fs.readdirSync(routersPath).map(content => {
        if (content.endsWith(extension)) {
            console.log(content)
            return content
        }
        const folder = fs.readdirSync(routersPath + "/" + content)
        if (folder.some(file => file === ("index" + extension))) return content + "/index" + extension
        else return undefined
    }).filter(Boolean) as string[];
    console.log(routerFiles)

    for (const file of routerFiles) {
        const filePath = path.join(routersPath, file);
        const routes = ((await import(pathToFileURL(filePath).href)).default as Router).routes()
        router.use(routes)
    }
}
app
    .use(serve('./public'))
    .use(bodyParser())
    .use(logger)
    .use(async (ctx, next) => {
        console.log("𖨆", ctx.method, " => ", ctx.path);
        await next();
    })
    .use(router.routes());
await getRouters()

app.listen(3000)