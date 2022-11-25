import urlcat from 'urlcat'
import { fetchCache } from '../../helpers.js'
import type { TwitterBaseAPI } from '../../types/Twitter.js'

export async function getUserNFTContainer(
    screenName: string,
    queryToken: string,
    bearerToken: string,
    csrfToken: string,
): Promise<{
    data: {
        user: {
            result: TwitterBaseAPI.NFTContainer
        }
    }
}> {
    const response = await fetchCache(
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
            headers: {
                authorization: `Bearer ${bearerToken}`,
                'x-csrf-token': csrfToken,
                'content-type': 'application/json',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-active-user': 'yes',
                referer: `https://twitter.com/${screenName}/nft`,
            },
        },
    )
    return response.json()
}
