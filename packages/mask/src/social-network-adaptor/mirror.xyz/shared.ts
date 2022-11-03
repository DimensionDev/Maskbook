import type { SocialNetwork } from '@masknet/social-network-infra'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { mirrorBase } from './base.js'
import { getUserIdentity } from './utils/user.js'

export const mirrorShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...mirrorBase,
    utils: {
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
        }),
        getUserIdentity,
    },
}
