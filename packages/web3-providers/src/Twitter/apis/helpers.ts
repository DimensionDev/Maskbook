import type { TwitterBaseAPI } from '@masknet/web3-providers/types'

export function createUser(result: TwitterBaseAPI.LegacyUserResult) {
    return {
        verified: result.legacy?.verified ?? false,
        has_nft_avatar: result.has_nft_avatar ?? false,
        userId: result.rest_id,
        nickname: result.legacy?.name ?? '',
        screenName: result.legacy?.screen_name ?? '', // handle
        avatarURL: result.legacy?.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1'),
        bio: result.legacy?.description,
        location: result.legacy?.location,
        homepage: result.legacy?.entities.url?.urls[0]?.expanded_url,
    }
}
