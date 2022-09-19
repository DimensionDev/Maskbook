import type { SocialNetwork } from '../../social-network/types.js'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { mirrorBase } from './base.js'

export const mirrorShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...mirrorBase,
    utils: {
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
        }),
    },
}
