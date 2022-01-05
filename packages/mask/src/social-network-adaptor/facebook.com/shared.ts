import type { SocialNetwork } from '../../social-network/types'
import { facebookBase } from './base'
import { getPostUrlAtFacebook, isValidFacebookUsername } from './utils/parse-username'
import { PostIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { SocialNetworkEnum } from '@masknet/encryption'

const getPostURL = (post: PostIdentifier): URL | null => {
    if (post.identifier instanceof ProfileIdentifier)
        return new URL(getPostUrlAtFacebook(post as PostIdentifier<ProfileIdentifier>))
    return null
}
export const facebookShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...facebookBase,
    utils: {
        getHomePage: () => 'https://www.facebook.com',
        getProfilePage: (userId: string) => 'https://www.facebook.com',
        isValidUsername: (v) => !!isValidFacebookUsername(v),
        getPostURL,
        getShareLinkURL(message) {
            const url = new URL('https://www.facebook.com/sharer/sharer.php')
            url.searchParams.set('quote', message)
            url.searchParams.set('u', 'mask.io')
            return url
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            getURLFromPostIdentifier: getPostURL,
            socialNetwork: SocialNetworkEnum.Facebook,
        }),
    },
}
