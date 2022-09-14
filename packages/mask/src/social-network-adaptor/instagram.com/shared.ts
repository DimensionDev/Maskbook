import type { SocialNetwork } from '../../social-network/types.js'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { instagramBase } from './base.js'

export const instagramShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...instagramBase,
    utils: {
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
        }),
    },
}
