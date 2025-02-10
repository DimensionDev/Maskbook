import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@masknet/shared-base'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type { FireflyFarcasterAPI } from '@masknet/web3-providers/types'
import { isZero } from '@masknet/web3-shared-base'
import { uniq } from 'lodash-es'
import urlcat from 'urlcat'
import { FIREFLY_BASE_URL } from './constants.js'
import { formatFarcasterPostFromFirefly, resolveFireflyResponseData } from './helpers.js'

export class FireflyFarcaster {
    static async getPostsByProfileId(fids: string | string[] | number | number[], indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_BASE_URL, '/v2/user/timeline/farcaster/casts')
        const response = await fetchJSON<FireflyFarcasterAPI.CastsResponse>(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                fids: Array.isArray(fids) ? uniq(fids.map((x) => x.toString())) : [fids.toString()],
                size: 25,
                cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
            }),
        })
        const { casts, cursor } = resolveFireflyResponseData(response)
        const data = casts.map((cast) => formatFarcasterPostFromFirefly(cast))

        return createPageable(
            data,
            createIndicator(indicator),
            cursor ? createNextIndicator(indicator, cursor) : undefined,
        )
    }
}
