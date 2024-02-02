import type { SiteAdaptor } from '@masknet/types'
import { createSiteAdaptorSpecializedPostContext } from '../../site-adaptor-infra/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { mirrorBase } from './base.js'
import { getUserIdentity } from './utils/user.js'

function getProfileURL() {
    return new URL('https://mirror.xyz/dashboard')
}
function getShareURL(text: string) {
    return new URL('https://mirror.xyz')
}

export const mirrorShared: SiteAdaptor.Shared & SiteAdaptor.Base = {
    ...mirrorBase,
    utils: {
        getProfileURL,
        getShareURL,
        createPostContext: createSiteAdaptorSpecializedPostContext(mirrorBase.networkIdentifier, {
            hasPayloadLike,
        }),
        getUserIdentity,
    },
}
