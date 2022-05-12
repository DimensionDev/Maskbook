import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { hasPayloadLike } from '../../utils'
import { openseaBase } from './base'

export const openseaShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...openseaBase,
    utils: {
        getHomePage: () => 'https://opensea.io/',
        getProfilePage: () => 'https://opensea.io/account',
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
        }),
    },
}
