import type { SocialNetwork } from '../../social-network/types'
import { facebookBase } from './base'
import { getPostUrlAtFacebook, isValidFacebookUsername } from './utils/parse-username'
import type { PostIdentifier } from '@masknet/shared-base'
import { hasPayloadLike } from '../../utils'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { openWindow } from '@masknet/shared-base-ui'
import { FacebookAdaptor } from '../../../shared/site-adaptors/implementations/facebook.com'

const getPostURL = (post: PostIdentifier): URL | null => {
    return new URL(getPostUrlAtFacebook(post))
}
export const facebookShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...facebookBase,
    utils: {
        isValidUsername: (v) => !!isValidFacebookUsername(v),
        getPostURL,
        share(message) {
            openWindow(FacebookAdaptor.getShareLinkURL?.(message))
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
