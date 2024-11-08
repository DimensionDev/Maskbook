import { first } from 'lodash-es'
import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { TWITTER_RESERVED_SLUGS } from '@masknet/injected-script/shared'
import { delay } from '@masknet/kit'
import { ProfileIdentifier } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import type { SiteAdaptorUI } from '@masknet/types'
import { FireflyTwitter } from '@masknet/web3-providers'
import { creator } from '../../../site-adaptor-infra/index.js'
import { twitterBase } from '../base.js'
import {
    searchSelfAvatarSelector,
    searchSelfHandleSelector,
    searchSelfNicknameSelector,
    searchWatcherAvatarSelector,
    selfInfoSelectors,
} from '../utils/selector.js'

function collectSelfInfo() {
    const handle = selfInfoSelectors().handle.evaluate()
    const nickname = selfInfoSelectors().name.evaluate()
    const avatar = selfInfoSelectors().userAvatar.evaluate()

    return { handle, nickname, avatar }
}

function getNickname(nickname?: string) {
    const nicknameNode = searchSelfNicknameSelector().closest<HTMLDivElement>(1).evaluate()
    let _nickname = ''
    if (!nicknameNode?.childNodes.length) return nickname

    for (const child of nicknameNode.childNodes) {
        const ele = child as HTMLDivElement
        if (ele.tagName === 'IMG') {
            _nickname += ele.getAttribute('alt') ?? ''
        }
        if (ele.tagName === 'SPAN') {
            _nickname += ele.textContent?.trim()
        }
    }

    return _nickname ?? nickname
}

function resolveLastRecognizedIdentityInner(
    ref: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    signal: AbortSignal,
) {
    const assign = async () => {
        await delay(2000)

        const selfInfo = collectSelfInfo()
        const avatar = (searchSelfAvatarSelector().evaluate()?.getAttribute('src') || selfInfo.avatar) ?? ''
        const handle =
            searchSelfHandleSelector().evaluate()?.dataset.testid?.trim().slice('UserAvatar-Container-'.length) ||
            selfInfo.handle
        const nickname = getNickname(selfInfo.nickname) ?? ''
        const userInfo = handle ? await FireflyTwitter.getUserInfo(handle) : null

        if (handle) {
            ref.value = {
                avatar,
                nickname,
                identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
                profileId: userInfo?.rest_id,
                isOwner: true,
            }
        }
    }

    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
        new MutationObserverWatcher(selector)
            .addListener('onAdd', () => assign())
            .addListener('onChange', () => assign())
            .startWatch(
                {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['src'],
                },
                signal,
            )
    }

    assign()

    window.addEventListener('locationchange', assign, { signal })
    createWatcher(searchSelfHandleSelector())
    createWatcher(searchWatcherAvatarSelector())
}

function getFirstSlug() {
    const slugs: string[] = location.pathname.split('/').filter(Boolean)
    return first(slugs)
}

function resolveCurrentVisitingIdentityInner(
    ref: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    ownerRef: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const update = async (screenName: string) => {
        const user = await queryClient.fetchQuery({
            retry: 0,
            staleTime: 3600_000,
            queryKey: ['twitter', 'profile', screenName],
            queryFn: () => FireflyTwitter.getUserInfo(screenName),
        })
        if (process.env.NODE_ENV === 'development') {
            console.assert(user, `Can't get get user by screen name ${screenName}`)
        }
        if (!user) return

        const legacy = user.legacy
        const handle = legacy.screen_name
        const ownerHandle = ownerRef.value.identifier?.userId
        const isOwner = !!ownerHandle && handle.toLowerCase() === ownerHandle.toLowerCase()
        const domAvatar = document.querySelector(`a[href="/${handle}/photo"] img`)
        // DOM avatar is more accurate, avatar from api could be outdate
        const avatar = domAvatar?.getAttribute('src') || legacy.profile_image_url_https
        const bio = legacy.profile_image_url_https
        const homepage = legacy.entities.url?.urls?.[0]?.expanded_url

        ref.value = {
            identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname: legacy.name,
            avatar,
            bio,
            homepage,
            isOwner,
        }
    }

    const slug = getFirstSlug()
    if (slug && !TWITTER_RESERVED_SLUGS.includes(slug)) {
        update(slug)
        if (!ownerRef.value.identifier) {
            const unsubscribe = ownerRef.addListener((val) => {
                update(slug)
                if (val) unsubscribe()
            })
        }
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

export const IdentityProviderTwitter: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}

export const CurrentVisitingIdentityProviderTwitter: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, IdentityProviderTwitter.recognized, cancel)
    },
}
