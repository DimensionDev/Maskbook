import type { SiteAdaptor } from '@masknet/types'
import { createSiteAdaptorSpecializedPostContext } from '../../site-adaptor-infra/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { instagramBase } from './base.js'

function getProfileURL(): URL | null {
    return new URL('https://www.instagram.com/')
}

export const instagramShared: SiteAdaptor.Shared & SiteAdaptor.Base = {
    ...instagramBase,
    utils: {
        getProfileURL,
        createPostContext: createSiteAdaptorSpecializedPostContext(instagramBase.networkIdentifier, {
            hasPayloadLike,
        }),
    },
}
