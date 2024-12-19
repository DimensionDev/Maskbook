import { EMPTY_LIST } from '@masknet/shared-base'
import { v4 as uuid } from 'uuid'
import { type PutObjectCommandInput, S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import urlcat from 'urlcat'
import type { FireflyConfigAPI } from '../entry-types.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { FIREFLY_BASE_URL } from './constants.js'

const BASE_URL = 'https://api.dimension.im/v1'
const TWITTER_HANDLER_VERIFY_URL = 'https://twitter-handler-proxy.r2d2.to'

export class FireflyConfig {
    static async getLensByTwitterId(
        twitterHandle?: string,
        isVerified = true,
    ): Promise<FireflyConfigAPI.LensAccount[]> {
        if (!twitterHandle) return EMPTY_LIST
        const result = await fetchJSON<FireflyConfigAPI.LensResult>(
            urlcat(BASE_URL, '/account/lens', {
                twitterHandle,
                isVerified,
            }),
        )
        if (result.code !== 200) return EMPTY_LIST
        return result.data
    }

    static async getVerifiedHandles(address: string) {
        const response = await fetchJSON<FireflyConfigAPI.VerifyTwitterResult>(
            urlcat(TWITTER_HANDLER_VERIFY_URL, '/v1/relation/handles', {
                wallet: address.toLowerCase(),
                isVerified: true,
            }),
        )
        if ('error' in response) return []
        return response.data
    }

    /**
     * @see https://www.notion.so/mask/v2-wallet-profile-f1cc2b3cd9dc49119cf493ae8a59dde9?pvs=4
     */
    static async getUnionProfile(
        profileOptions: FireflyConfigAPI.UnionProfileOptions,
    ): Promise<FireflyConfigAPI.UnionProfile> {
        const url = urlcat(FIREFLY_BASE_URL, 'v2/wallet/profile', profileOptions)
        const response = await fetchJSON<FireflyConfigAPI.UnionProfileResponse>(url)
        return response.data
    }

    static async uploadToS3(file: File) {
        const url = urlcat(FIREFLY_BASE_URL, '/v2/farcaster-hub/uploadMediaToken')
        const res = await fetchJSON<FireflyConfigAPI.UploadMediaTokenResponse>(url)
        const mediaToken = res.data
        const client = new S3({
            credentials: {
                accessKeyId: mediaToken.accessKeyId,
                secretAccessKey: mediaToken.secretAccessKey,
                sessionToken: mediaToken.sessionToken,
            },
            region: mediaToken.region || 'us-west-2',
            maxAttempts: 5,
        })

        const params: PutObjectCommandInput = {
            Bucket: mediaToken.bucket,
            Key: `maskbook/${uuid()}/${file.name}`,
            Body: file,
            ContentType: file.type,
        }
        const task = new Upload({
            client,
            params,
            partSize: 1024 * 1024 * 5, // part upload
            queueSize: 3,
        })

        await task.done()

        return `https://${mediaToken.cdnHost}/${params.Key}`
    }
}
