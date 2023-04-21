import urlcat from 'urlcat'
import { fetchJSON } from '../entry-helpers.js'
import { BASE_URL } from './constants.js'
import type { FireflyLensAccount, LensResult } from './types.js'

export class FireflyAPI {
    async getLensByTwitterId(twitterHandle: string): Promise<FireflyLensAccount[]> {
        const result = await fetchJSON<LensResult>(
            urlcat(BASE_URL, '/account/lens', {
                twitterHandle,
            }),
        )
        if (result.code !== 200) return []
        return result.data
    }
}
