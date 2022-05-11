import type { PostIdentifier } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import urlcat from 'urlcat'
import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { hasPayloadLike } from '../../utils'
import { mindsBase } from './base'
import { usernameValidator } from './utils/user'

const getPostURL = (post: PostIdentifier): URL => {
    return new URL(`https://minds.com/newsfeed/${post.postId}`)
}
export const mindsShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...mindsBase,
    utils: {
        getHomePage: () => 'https://www.minds.com',
        getProfilePage: () => 'https://www.minds.com',
        isValidUsername: usernameValidator,
        textPayloadPostProcessor: undefined,
        getPostURL,
        share(message) {
            openWindow(this.getShareLinkURL?.(message))
        },
        getShareLinkURL(message) {
            const url = urlcat('https://www.minds.com/newsfeed/subscriptions', {
                intentUrl: message,
            })
            return new URL(url)
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
