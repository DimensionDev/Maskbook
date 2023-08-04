import urlcat from 'urlcat'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

export async function getUserNFTAvatar(screenName: string) {
    return fetchCachedJSON<TwitterBaseAPI.UserNFTAvatarResponse>(
        urlcat('https://yb0w3z63oa.execute-api.us-east-1.amazonaws.com/prod/twitter-nft-avatar', { screenName }),
    )
}
