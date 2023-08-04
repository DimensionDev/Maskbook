import urlcat from 'urlcat'
import { getTokens, getHeaders } from './getTokens.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

export async function getUserNFTContainer(screenName: string) {
    const { queryToken } = await getTokens()

    return fetchJSON<{
        data: {
            user: {
                result: TwitterBaseAPI.NFTContainer
            }
        }
    }>(
        urlcat('https://twitter.com/i/api/graphql/:queryToken/userNftContainer_Query', {
            queryToken,
            variables: JSON.stringify({
                screenName,
            }),
            features: JSON.stringify({
                responsive_web_twitter_blue_verified_badge_is_enabled: false,
            }),
        }),
        {
            headers: await getHeaders({
                referer: `https://twitter.com/${screenName}/nft`,
            }),
        },
    )
}
