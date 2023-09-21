import urlcat from 'urlcat'
import { getHeaders } from './getTokens.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

export async function getUserNFTContainer(screenName: string) {
    return await fetchJSON<{
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
            headers: getHeaders({
                referer: `https://twitter.com/${screenName}/nft`,
            }),
            credentials: 'include',
        },
    )
}
