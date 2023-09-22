import urlcat from 'urlcat'
import { getHeaders } from './getTokens.js'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { Duration, Expiration } from '../../entry-helpers.js'

export async function getUserNFTContainer(screenName: string) {
    return fetchCachedJSON<{
        data: {
            user: {
                result: TwitterBaseAPI.NFTContainer
            }
        }
    }>(
        urlcat('https://twitter.com/i/api/graphql/z-_uxIiYELU35OzocPdDIw/userNftContainer_Query', {
            variables: JSON.stringify({
                screenName,
            }),
        }),
        {
            headers: await getHeaders({
                referer: `https://twitter.com/${screenName}/nft`,
            }),
            credentials: 'include',
        },
        {
            cacheDuration: Duration.ONE_DAY,
            squashExpiration: Expiration.ONE_SECOND,
        },
    )
}
