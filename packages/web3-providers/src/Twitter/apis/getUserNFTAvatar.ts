import urlcat from 'urlcat'
import { fetchJSON } from '../../entry-helpers.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

export async function getUserNFTAvatar(screenName: string) {
    return fetchJSON<TwitterBaseAPI.UserNFTAvatarResponse>(
        urlcat('https://yb0w3z63oa.execute-api.us-east-1.amazonaws.com/prod/twitter-nft-avatar', { screenName }),
        undefined,
        {
            enableSquash: true,
            enableCache: true,
        },
    )
}
