import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { hasPayloadLike } from '../../utils'
import { openseaBase } from './base'

export const openseaShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...openseaBase,
    utils: {
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
        }),
    },
}
