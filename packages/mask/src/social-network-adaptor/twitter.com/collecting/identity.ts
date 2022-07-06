import { delay } from '@dimensiondev/kit'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Twitter } from '@masknet/web3-providers'
import { ProfileIdentifier } from '@masknet/shared-base'
import {
    searchSelfHandleSelector,
    searchSelfNicknameSelector,
    searchSelfAvatarSelector,
    searchWatcherAvatarSelector,
    selfInfoSelectors,
} from '../utils/selector'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import { twitterBase } from '../base'
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
    }

    assign()

    window.addEventListener('locationchange', assign, { signal: cancel })
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
    const update = async (event: WindowEventMap['scenechange']) => {
        if (event.detail.scene !== 'profile' || !event.detail.value) return
        const twitterId = event.detail.value
        const user = await Twitter.getUserByScreenName(twitterId)
        const bio = user.legacy.description

        const nickname = user.legacy.name
        const handle = user.legacy.screen_name
        const avatar = user.legacy.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1')
        const homepage = user.legacy.entities.url?.urls[0]?.expanded_url ?? ''

        ref.value = {
            identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname,
            avatar,
            bio,
            homepage,
        }
    }

    window.addEventListener('scenechange', update, { signal: cancel })
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
