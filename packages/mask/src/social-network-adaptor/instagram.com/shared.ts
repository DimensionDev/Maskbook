import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { instagramBase } from './base'

export const instagramShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...instagramBase,
    utils: {
        getHomePage: () => 'https://www.instagram.com/',
        getProfilePage: () => 'https://www.instagram.com/',
        createPostContext: createSNSAdaptorSpecializedPostContext({
            socialNetwork: SocialNetworkEnum.Instagram,
        }),
    },
}
