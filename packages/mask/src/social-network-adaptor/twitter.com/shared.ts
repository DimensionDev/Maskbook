import { PostIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { hasPayloadLike } from '../../utils'
import { twitterBase } from './base'
import { TwitterDecoder } from '@masknet/encryption'
import { usernameValidator } from './utils/user'
import { TwitterAdaptor } from '../../../shared/site-adaptors/implementations/twitter.com'

const getPostURL = (post: PostIdentifier): URL | null => {
    if (!(post.identifier instanceof ProfileIdentifier)) return null
    return new URL(`https://twitter.com/${post.identifier.userId}/status/${post.postId}`)
}
export const twitterShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...twitterBase,
    utils: {
        isValidUsername: usernameValidator,
        getPostURL,
        share(text) {
            const url = TwitterAdaptor.getShareLinkURL!(text)
            const width = 700
            const height = 520
            const openedWindow = openWindow(url, 'share', {
                width,
                height,
                screenX: window.screenX + (window.innerWidth - width) / 2,
                screenY: window.screenY + (window.innerHeight - height) / 2,
                opener: true,
                referrer: true,
                behaviors: {
                    toolbar: true,
                    status: true,
                    resizable: true,
                    scrollbars: true,
                },
            })
            if (openedWindow === null) {
                location.assign(url)
            }
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike: (text) => {
                return TwitterDecoder(text).map(hasPayloadLike).unwrapOr(false)
            },
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
