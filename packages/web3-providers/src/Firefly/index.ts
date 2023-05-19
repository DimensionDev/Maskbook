import urlcat from 'urlcat'
import { EMPTY_LIST } from '@masknet/shared-base'
import { BASE_URL } from './constants.js'
import { fetchJSON } from '../entry-helpers.js'
import type { FireflyBaseAPI } from '../entry-types.js'

export class FireflyAPI implements FireflyBaseAPI.Provider {
    async getLensByTwitterId(twitterHandle?: string): Promise<FireflyBaseAPI.LensAccount[]> {
        if (!twitterHandle) return EMPTY_LIST
        const result = await fetchJSON<FireflyBaseAPI.LensResult>(
            urlcat(BASE_URL, '/account/lens', {
                twitterHandle,
            }),
        )
        if (result.code !== 200) return EMPTY_LIST
        return result.data
    }
}
