import type { SiteAdaptorUI } from '@masknet/types'
import { Twitter } from '@masknet/web3-providers'
import type { TwitterBaseAPI } from '@masknet/web3-providers/types'

export async function publishPostTwitter(
    mediaObjects: Array<string | Blob>,
    options?: SiteAdaptorUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
) {
    const images = mediaObjects.filter((x) => typeof x !== 'string') as Blob[]
    const allSettled = await Promise.allSettled(images.map((x) => Twitter.uploadMedia(x)))
    const mediaIds = allSettled
        .map((x) => x.status === 'fulfilled' && x.value?.media_id_string)
        .filter(Boolean) as string[]

    const variables: TwitterBaseAPI.Tweet = {
        tweet_text: mediaObjects.filter((x) => typeof x === 'string').join('\n'),
    }

    if (mediaIds.length > 0)
        variables.media = {
            media_entities: mediaIds.map((x) => ({ media_id: x, tagged_users: [] })),
            possibly_sensitive: false,
        }

    if (options?.reason === 'reply') {
        const replyTweetId = location.href.match(/\/status\/(\d+)/)?.[1]

        if (replyTweetId) {
            variables.reply = {
                in_reply_to_tweet_id: replyTweetId,
                exclude_reply_user_ids: [],
            }
        }
    }

    const postId = await Twitter.createTweet(variables)
    return postId
}
