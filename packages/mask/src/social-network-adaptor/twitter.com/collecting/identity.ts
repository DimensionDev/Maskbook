import { delay } from '@dimensiondev/kit'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Twitter } from '@masknet/web3-providers'
import { ProfileIdentifier } from '@masknet/shared-base'
import {
    searchAvatarSelector,
    searchAvatarMetaSelector,
    searchSelfHandleSelector,
    searchSelfNicknameSelector,
    searchSelfAvatarSelector,
    searchWatcherAvatarSelector,
    selfInfoSelectors,
} from '../utils/selector'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import Services from '../../../extension/service'
import { twitterBase } from '../base'
import { getAvatar, getBio, getNickname, getTwitterId, getPersonalHomepage } from '../utils/user'
import { isMobileTwitter } from '../utils/isMobile'

function recognizeDesktop() {
    const collect = () => {
        const handle = selfInfoSelectors().handle.evaluate()
        const nickname = selfInfoSelectors().name.evaluate()
        const avatar = selfInfoSelectors().userAvatar.evaluate()

        return { handle, nickname, avatar }
    }

    const watcher = new MutationObserverWatcher(selfInfoSelectors().handle)

    return { watcher, collect }
}

function recognizeMobile() {
    const collect = () => {
        const avatar = searchSelfAvatarSelector().evaluate()?.getAttribute('src') ?? ''
        const handle = searchSelfHandleSelector().evaluate()?.textContent?.trim()?.replace(/^@/, '')
        const nickname = searchSelfNicknameSelector().evaluate()?.textContent?.trim() ?? ''

        return { handle, nickname, avatar }
    }

    const watcher = new MutationObserverWatcher(searchSelfHandleSelector())

    return { watcher, collect }
}

function resolveLastRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        await delay(5000)
        const avatar = searchSelfAvatarSelector().evaluate()?.getAttribute('src') ?? ''
        const handle = searchSelfHandleSelector().evaluate()?.textContent?.trim()?.replace(/^@/, '')
        const nickname = searchSelfNicknameSelector().evaluate()?.textContent?.trim() ?? ''

        if (handle) {
            ref.value = {
                avatar,
                nickname,
                identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            }
        }
    }

    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
        const watcher = new MutationObserverWatcher(selector)
            .addListener('onAdd', () => assign())
            .addListener('onChange', () => assign())
            .startWatch({
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src'],
            })

        window.addEventListener('locationchange', assign, { signal: cancel })
        cancel.addEventListener('abort', () => {
            window.removeEventListener('locationchange', assign)
            watcher.stopWatch()
        })
    }

    assign()

    createWatcher(searchSelfHandleSelector())
    createWatcher(searchWatcherAvatarSelector())
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
            }
        }
    }

    onLocationChange()
    window.addEventListener('locationchange', onLocationChange, { signal: cancel })
}

function resolveCurrentVisitingIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const avatarSelector = searchAvatarSelector()
    const avatarMetaSelector = searchAvatarMetaSelector()
    const assign = async () => {
        await delay(5000)
        const bio = getBio()
        const homepage = getPersonalHomepage()
        const nickname = getNickname()
        const handle = getTwitterId()
        const avatar = getAvatar()

        ref.value = {
            identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname,
            avatar,
            bio,
        }
        Services.Helper.resolveTCOLink(homepage).then((link) => {
            if (cancel?.aborted || !link) return
            ref.value = {
                ...ref.value,
                homepage: link,
            }
        })
    }
    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
        const watcher = new MutationObserverWatcher(selector)
            .addListener('onAdd', () => assign())
            .addListener('onChange', () => assign())
            .startWatch({
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'content'],
            })

        window.addEventListener('locationchange', assign, { signal: cancel })
        cancel.addEventListener('abort', () => {
            window.removeEventListener('locationchange', assign)
            watcher.stopWatch()
        })
    }

    assign()

    createWatcher(avatarSelector)
    createWatcher(avatarMetaSelector)
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
        resolveCurrentVisitingIdentityInner(this.recognized, cancel)
    },
}
