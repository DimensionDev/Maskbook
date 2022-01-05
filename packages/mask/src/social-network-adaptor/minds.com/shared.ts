import type { PostIdentifier } from '@masknet/shared-base'
import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
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
        getPostURL,
        getShareLinkURL(message) {
            return new URL(`https://www.minds.com/newsfeed/subscriptions?intentUrl=${encodeURIComponent(message)}`)
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
