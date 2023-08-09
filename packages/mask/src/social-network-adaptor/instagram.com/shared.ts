import type { SiteAdaptor } from '@masknet/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { instagramBase } from './base.js'

export const instagramShared: SiteAdaptor.Shared & SiteAdaptor.Base = {
    ...instagramBase,
    utils: {
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
        }),
    },
}
