import { first } from 'lodash-es'
import { TWITTER_RESERVED_SLUGS } from '@masknet/injected-script/shared'
import { ProfileIdentifier } from '@masknet/shared-base'
import { Twitter } from '@masknet/web3-providers'
import type { SocialNetworkUI as Next } from '@masknet/types'
import { creator } from '../../../social-network/index.js'
import { twitterBase } from '../base.js'
import { isMobileTwitter } from '../utils/isMobile.js'

function resolveLastRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        const settings = await Twitter.getSettings()
        const user = await Twitter.getUserByScreenName(settings.screen_name)
        const identifier = ProfileIdentifier.of(twitterBase.networkIdentifier, settings?.screen_name).unwrapOr(
            undefined,
        )
        if (identifier && !ref.value.identifier)
            ref.value = {
                avatar: user?.legacy?.profile_image_url_https,
                nickname: user?.legacy?.name,
                identifier,
                isOwner: true,
            }
    }
    assign()
    window.addEventListener('locationchange', assign, { signal: cancel })
}

function resolveLastRecognizedIdentityMobileInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const onLocationChange = async () => {
        const settings = await Twitter.getSettings()
        const identifier = ProfileIdentifier.of(twitterBase.networkIdentifier, settings?.screen_name).unwrapOr(
            undefined,
        )

        if (identifier && !ref.value.identifier) {
            ref.value = {
                ...ref.value,
                identifier,
                isOwner: true,
            }
        }
    }

    onLocationChange()
    window.addEventListener('locationchange', onLocationChange, { signal: cancel })
}

function getFirstSlug() {
    const slugs: string[] = location.pathname.split('/').filter(Boolean)
    return first(slugs)
}

function resolveCurrentVisitingIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    ownerRef: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const update = async (twitterId: string) => {
        const user = await Twitter.getUserByScreenName(twitterId)
        if (process.env.NODE_ENV === 'development') {
            console.assert(user?.legacy, `Can't get get user by screen name ${twitterId}`)
        }
        if (!user?.legacy) return

        const nickname = user.legacy.name
        const handle = user.legacy.screen_name
        const ownerHandle = ownerRef.value.identifier?.userId
        const isOwner = !!(ownerHandle && handle.toLowerCase() === ownerHandle.toLowerCase())
        const avatar = user.legacy.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1')
        const bio = user.legacy.description
        const homepage = user.legacy.entities.url?.urls[0]?.expanded_url ?? ''

        ref.value = {
            identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname,
            avatar,
            bio,
            homepage,
            isOwner,
        }
    }

    const slug = getFirstSlug()
    if (slug && !TWITTER_RESERVED_SLUGS.includes(slug)) {
        update(slug)
    }

    window.addEventListener(
        'scenechange',
        (event) => {
            if (event.detail.scene !== 'profile') return
            const twitterId = event.detail.value
            update(twitterId)
        },
        { signal: cancel },
    )
}

export const IdentityProviderTwitter: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
        if (isMobileTwitter) resolveLastRecognizedIdentityMobileInner(this.recognized, cancel)
    },
}

export const CurrentVisitingIdentityProviderTwitter: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, IdentityProviderTwitter.recognized, cancel)
    },
}
