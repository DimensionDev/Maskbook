import urlcat from 'urlcat'
import { EMPTY_LIST } from '@masknet/shared-base'
import { BASE_URL, TWITTER_HANDLER_VERIFY_URL } from './constants.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { FireflyBaseAPI } from '../entry-types.js'

export class FireflyAPI implements FireflyBaseAPI.Provider {
    async getLensByTwitterId(twitterHandle?: string, isVerified = true): Promise<FireflyBaseAPI.LensAccount[]> {
        if (!twitterHandle) return EMPTY_LIST
        const result = await fetchJSON<FireflyBaseAPI.LensResult>(
            urlcat(BASE_URL, '/account/lens', {
                twitterHandle,
                isVerified,
            }),
        )
        if (result.code !== 200) return EMPTY_LIST
        return result.data
    }
    async verifyTwitterHandleByAddress(address: string, handle?: string): Promise<boolean> {
        if (!handle || !address) return false
        const response = await fetchJSON<FireflyBaseAPI.VerifyTwitterResult>(
            urlcat(TWITTER_HANDLER_VERIFY_URL, '/v1/relation/handles', {
                wallet: address.toLowerCase(),
                isVerified: true,
            }),
        )

        if ('error' in response) return false

        return response.data.includes(handle)
    }
}
