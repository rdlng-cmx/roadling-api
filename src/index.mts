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
import grabEnv from './helpers/grabEnv.mts';
import crawlDir from './helpers/crawlDir.mts';
import { ServerModule } from './interfaces/ServerComponent.mts';

export const app = new Koa();

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

const getModules = crawlDir(path.join(import.meta.dirname, 'components'), async (file: ServerModule<string, any>) => {
    await file.hook(app)
})
const getRouters = crawlDir(path.join(import.meta.dirname, 'routers'), (file: Router) => {
        const routes = file.routes()
        router.use(routes)
    })
app
    .use(serve('./public'))
    .use(bodyParser())
    .use(logger)
    .use(router.routes());
await getRouters()
await getModules()

app.listen(3000)