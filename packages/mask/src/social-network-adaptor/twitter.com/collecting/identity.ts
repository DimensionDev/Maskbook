import { delay } from '@dimensiondev/kit'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Twitter } from '@masknet/web3-providers'
import { ProfileIdentifier } from '@masknet/shared-base'
import { first } from 'lodash-unified'
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

function _getNickname(nickname?: string) {
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
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        await delay(2000)
        const { collect } = recognizeDesktop()
        const dataFromScript = collect()
        const avatar = (searchSelfAvatarSelector().evaluate()?.getAttribute('src') || dataFromScript.avatar) ?? ''
        const handle =
            searchSelfHandleSelector().evaluate()?.textContent?.trim()?.replace(/^@/, '') || dataFromScript.handle
        const nickname = _getNickname(dataFromScript.nickname) ?? ''

        if (handle) {
            ref.value = {
                avatar,
                nickname,
                identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
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
                cancel,
            )

        window.addEventListener('locationchange', assign, { signal: cancel })
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

const getFirstSlug = () => {
    const slugs = location.pathname.split('/').filter((x) => x)
    return first(slugs)
}

function resolveCurrentVisitingIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const avatarSelector = searchAvatarSelector()
    const avatarMetaSelector = searchAvatarMetaSelector()
    let firstSlug = getFirstSlug()
    const assign = async () => {
        const newFirstSlug = getFirstSlug()
        // reset to void wrong value
        if (firstSlug !== newFirstSlug) {
            ref.value = {}
            firstSlug = newFirstSlug
        }
        await delay(2000)
        const bio = getBio()
        const nickname = getNickname()
        const handle = getTwitterId()
        const avatar = getAvatar()
        const homepage = await Services.Helper.resolveTCOLink(getPersonalHomepage())

        ref.value = {
            identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname,
            avatar,
            bio,
            homepage: homepage ?? '',
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
                    attributeFilter: ['src', 'content'],
                },
                cancel,
            )

        window.addEventListener('locationchange', assign, { signal: cancel })
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
