import urlcat from 'urlcat'
import { type ProfileIdentifier, type PostIdentifier } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import type { SiteAdaptor } from '@masknet/types'
import { createSiteAdaptorSpecializedPostContext } from '../../site-adaptor-infra/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { mindsBase } from './base.js'
import { usernameValidator } from './utils/user.js'

function getPostURL(post: PostIdentifier): URL {
    return new URL(`https://minds.com/newsfeed/${post.postId}`)
}

function getProfileURL(profile: ProfileIdentifier): URL | null {
    return new URL('https://www.minds.com')
}

function getShareURL(text: string): URL | null {
    return new URL(
        urlcat('https://www.minds.com/newsfeed/subscriptions', {
            intentUrl: text,
        }),
    )
}

export const mindsShared: SiteAdaptor.Shared & SiteAdaptor.Base = {
    ...mindsBase,
    utils: {
        isValidUsername: usernameValidator,
        getPostURL,
        getProfileURL,
        share(message) {
            openWindow(getShareURL(message))
        },
        createPostContext: createSiteAdaptorSpecializedPostContext(mindsBase.networkIdentifier, {
            hasPayloadLike,
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
