import urlcat from 'urlcat'
import { EMPTY_LIST } from '@masknet/shared-base'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { FireflyConfigAPI } from '../entry-types.js'

const BASE_URL = 'https://api.dimension.im/v1'
const TWITTER_HANDLER_VERIFY_URL = 'https://twitter-handler-proxy.r2d2.to'
const FIREFLY_BASE_URL = 'https://api.firefly.land'

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
}
