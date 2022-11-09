import type { SocialNetwork } from '@masknet/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { openseaBase } from './base.js'

export const openseaShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...openseaBase,
    utils: {
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
        }),
    },
}
