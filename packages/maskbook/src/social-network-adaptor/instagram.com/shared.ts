import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { deconstructPayload } from '../../utils'
import { instagramBase } from './base'

export const instagramShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...instagramBase,
    utils: {
        getHomePage: () => 'https://www.instagram.com/',
        createPostContext: createSNSAdaptorSpecializedPostContext({
            payloadParser: deconstructPayload,
        }),
    },
}
