import type { SocialNetwork } from '../../social-network/types'
import { facebookBase } from './base'
import { getPostUrlAtFacebook, isValidFacebookUsername } from './utils/parse-username'
import type { PostIdentifier } from '@masknet/shared-base'
import { hasPayloadLike } from '../../utils'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { openWindow } from '@masknet/shared-base-ui'
import urlcat from 'urlcat'

const getPostURL = (post: PostIdentifier): URL | null => {
    return new URL(getPostUrlAtFacebook(post))
}
export const facebookShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...facebookBase,
    utils: {
        getHomePage: () => 'https://www.facebook.com',
        getProfilePage: (userId: string) => 'https://www.facebook.com',
        isValidUsername: (v) => !!isValidFacebookUsername(v),
        textPayloadPostProcessor: undefined,
        getPostURL,
        share(message) {
            openWindow(this.getShareLinkURL?.(message))
        },
        getShareLinkURL(message) {
            const url = urlcat('https://www.facebook.com/sharer/sharer.php', {
                quote: message,
                u: 'mask.io',
            })
            return new URL(url)
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
