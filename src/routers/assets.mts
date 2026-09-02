import Router from "@koa/router"
import multer, { type File } from "@koa/multer"
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Asset from "../models/Asset.mts"
import mime from 'mime'
import Koa, { type Context } from "koa";
import { Error } from 'mongoose'
import bytes from 'bytes'
import sharp from "sharp";
interface IAsset {
    id: string,
    name: string,
    location: string
}

const router = new Router()

const findAssets: Koa.Middleware = async (ctx: Context, next) => {
    const { get, from, by } = ctx.query

    let assets: IAsset[] = []
    if (get) {
        try {
        const keys = Array.isArray(get) ? get : [get]
        assets = (await Promise.all(keys.map(key => Asset.findById(key)))).filter(Boolean) as IAsset[]
        } catch(error) {
            if (error instanceof Error.CastError) ctx.throw(400, error.message)
        }
    }
    else {
        const fromQuery = from ? {} : {}
        const byQuery = by ? {} : {}
        const query = { ...fromQuery, ...byQuery }
        assets = await Asset.find(query)
    }
    ctx.assert(assets.length > 0, 404, "No assets found.")
    ctx.target = assets
    await next();
}

const compressUploads: Koa.Middleware = async (ctx: Context, next) => {
    if (!ctx.files) return;
    const files = (Array.isArray(ctx.files)) ? ctx.files : ctx.files["files"]
    for (const file of files) {
        if (file.mimetype.includes("image")) {
            const buffer = await sharp(file.buffer).webp({
                lossless: true
            }).toBuffer()
            file.buffer = buffer
            file.mimetype = mime.getType("webp") as string
        }
    }
    await next();
}

router
    .prefix("/assets")
    .get("/",
        findAssets,
        async (ctx: Context, next) => {
            const { AMAZON_S3_BUCKET_NAME } = process.env
            const directory: { [key: string]: string } = {}
            const assets: IAsset[] = ctx.target
            ctx.assert(assets, 404)
            ctx.assert(assets.length > 0, 404)

            const s3 = ctx.s3 as S3Client
            for (const asset of assets) {
                ctx.assert(asset.location, 400)

                const command = new GetObjectCommand({
                    Bucket: AMAZON_S3_BUCKET_NAME,
                    Key: asset.location,
                    ResponseContentDisposition: `attachment; filename="${asset.location}"`
                })
                const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
                directory[asset.id] = url
            }

            ctx.body = directory
            await next();
        })
    .post("/",
        multer({
            limits: {
                fileSize: bytes("1mb") ?? undefined
            }
        }).array("files"),
        compressUploads,
        async (ctx: Context, next) => {
            ctx.assert(ctx.files)
            const assets = ctx.files as unknown as Array<File>
            
            const { AMAZON_S3_BUCKET_NAME } = process.env
            const s3: S3Client = ctx.s3
            const directory: { [field: string]: string } = {}
            for (const asset of assets) {
                const session = await Asset.startSession()
                await session.withTransaction(async () => {
                    const newAsset = new Asset({
                        name: asset.originalname
                    })
                    await newAsset.save()
                    const location = "asset_" + newAsset.id + "." + mime.getExtension(asset.mimetype)
                    const params = {
                        Bucket: AMAZON_S3_BUCKET_NAME,
                        Key: location,
                        Body: asset.buffer,
                        ContentType: asset.mimetype
                    }
                    const command = new PutObjectCommand(params)
                    await s3.send(command)

                    newAsset.location = location
                    await newAsset.save()

                    const { name } = newAsset
                    directory[name] = newAsset.id
                })
                await session.endSession()
            }
            ctx.body = directory
            await next();
        }
    )
    .delete("/",
        findAssets,
        async (ctx: Context, next) => {
            const { AMAZON_S3_BUCKET_NAME } = process.env
            const assets = ctx.target
            const s3 = ctx.s3 as S3Client
            if (!assets) return;
            for (const asset of assets) {
                if (!asset) throw new Error("No asset found");
                if (!asset.location) throw new Error("No location on asset");

                const command = new DeleteObjectCommand({
                    Bucket: AMAZON_S3_BUCKET_NAME,
                    Key: asset.location
                })
                await s3.send(command)
                await asset.deleteOne()
            }
            await next();
        }
    )

export default router
