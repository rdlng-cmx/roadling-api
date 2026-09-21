import { S3Client } from "@aws-sdk/client-s3"
import generateComponent from "../helpers/generateComponent.mts"
import grabEnv from "../helpers/grabEnv.mts"

const name = "s3" as const
const component = generateComponent<typeof name, S3Client>(name, () => {
    const {accessKey, secretAccessKey, bucketRegion} = grabEnv("s3")
    return new S3Client({
    credentials: {
        accessKeyId: accessKey as string,
        secretAccessKey: secretAccessKey as string
    },
    region: bucketRegion as string
})
})
export default component
