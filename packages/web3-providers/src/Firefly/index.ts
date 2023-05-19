import urlcat from 'urlcat'
import { BASE_URL, TWITTER_HANDLER_VERIFY_URL } from './constants.js'
import { fetchJSON } from '../entry-helpers.js'
import type { FireflyBaseAPI } from '../entry-types.js'

export class FireflyAPI implements FireflyBaseAPI.Provider {
    async getLensByTwitterId(twitterHandle?: string): Promise<FireflyBaseAPI.LensAccount[]> {
        if (!twitterHandle) return []
        const result = await fetchJSON<FireflyBaseAPI.LensResult>(
            urlcat(BASE_URL, '/account/lens', {
                twitterHandle,
            }),
        )
        if (result.code !== 200) return []
        return result.data
    }
    async verifyTwitterHandlerByAddress(address: string, handler?: string): Promise<boolean> {
        if (!handler || !address) return false
        const response = await fetchJSON<FireflyBaseAPI.VerifyTwitterResult>(
            urlcat(TWITTER_HANDLER_VERIFY_URL, '/v1/relation/handles', {
                wallet: address.toLowerCase(),
                isVerified: true,
            }),
        )

        if ('error' in response) return false

        return response.data.includes(handler) || response.data.filter(Boolean).length === 0
    }
}
