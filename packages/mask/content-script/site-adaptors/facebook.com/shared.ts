import urlcat from 'urlcat'
import type { SiteAdaptor } from '@masknet/types'
import { facebookBase } from './base.js'
import { getPostUrlAtFacebook, isValidFacebookUsername } from './utils/parse-username.js'
import { type ProfileIdentifier, type PostIdentifier } from '@masknet/shared-base'
import { hasPayloadLike } from '../../utils/index.js'
import { createSiteAdaptorSpecializedPostContext } from '../../site-adaptor-infra/utils/create-post-context.js'
import { openWindow } from '@masknet/shared-base-ui'

function getPostURL(post: PostIdentifier): URL | null {
    return new URL(getPostUrlAtFacebook(post))
}
function getProfileURL(profile: ProfileIdentifier): URL | null {
    return new URL('https://www.facebook.com')
}
function getShareURL(text: string): URL | null {
    return new URL(
        urlcat('https://www.facebook.com/sharer/sharer.php', {
            quote: text,
            u: 'mask.io',
        }),
    )
}
export const facebookShared: SiteAdaptor.Shared & SiteAdaptor.Base = {
    ...facebookBase,
    utils: {
        isValidUsername: (v) => !!isValidFacebookUsername(v),
        getPostURL,
        getProfileURL,
        share(message) {
            openWindow(getShareURL?.(message))
        },
        createPostContext: createSiteAdaptorSpecializedPostContext(facebookBase.networkIdentifier, {
            hasPayloadLike,
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
