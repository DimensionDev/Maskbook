import type { SiteAdaptor } from '@masknet/types'
import { createSiteAdaptorSpecializedPostContext } from '../../site-adaptor-infra/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { openseaBase } from './base.js'

export const openseaShared: SiteAdaptor.Shared & SiteAdaptor.Base = {
    ...openseaBase,
    utils: {
        createPostContext: createSiteAdaptorSpecializedPostContext({
            hasPayloadLike,
        }),
    },
}
