import urlcat from 'urlcat'
import { type PostIdentifier, ProfileIdentifier, twitterDomainMigrate } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import type { SiteAdaptor } from '@masknet/types'
import { createSiteAdaptorSpecializedPostContext } from '../../site-adaptor-infra/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { twitterBase } from './base.js'
import { TwitterDecoder } from '@masknet/encryption'
import { getUserIdentity, usernameValidator } from './utils/user.js'

function getPostURL(post: PostIdentifier): URL | null {
    if (!(post.identifier instanceof ProfileIdentifier)) return null
    return new URL(twitterDomainMigrate(`https://x.com/${post.identifier.userId}/status/${post.postId}`))
}
function getProfileURL(profile: ProfileIdentifier): URL | null {
    return new URL(twitterDomainMigrate(`https://x.com/${profile.userId}`))
}
function getShareURL(text: string): URL | null {
    return new URL(urlcat(twitterDomainMigrate('https://x.com/intent/tweet'), { text }))
}
export const twitterShared: SiteAdaptor.Shared & SiteAdaptor.Base = {
    ...twitterBase,
    utils: {
        isValidUsername: usernameValidator,
        getPostURL,
        getProfileURL,
        getShareURL,
        share(text) {
            const url = getShareURL(text)
            const width = 700
            const height = 520
            const openedWindow = openWindow(url, 'share', {
                width,
                height,
                screenX: window.screenX + (window.innerWidth - width) / 2,
                screenY: window.screenY + (window.innerHeight - height) / 2,
                opener: true,
                referrer: true,
                behaviors: {
                    toolbar: true,
                    status: true,
                    resizable: true,
                    scrollbars: true,
                },
            })
            if (openedWindow === null && url) {
                location.assign(url)
            }
        },
        createPostContext: createSiteAdaptorSpecializedPostContext(twitterBase.networkIdentifier, {
            hasPayloadLike: (text) => {
                return TwitterDecoder(text).map(hasPayloadLike).unwrapOr(false)
            },
            getURLFromPostIdentifier: getPostURL,
        }),
        getUserIdentity,
    },
}
