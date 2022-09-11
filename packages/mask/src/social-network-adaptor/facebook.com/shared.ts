import type { SocialNetwork } from '../../social-network/types.js'
import { facebookBase } from './base.js'
import { getPostUrlAtFacebook, isValidFacebookUsername } from './utils/parse-username.js'
import type { PostIdentifier } from '@masknet/shared-base'
import { hasPayloadLike } from '../../utils/index.js'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context.js'
import { openWindow } from '@masknet/shared-base-ui'
import { FacebookAdaptor } from '../../../shared/site-adaptors/implementations/facebook.com.js'

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
