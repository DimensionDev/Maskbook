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
} from '../utils/selector'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import Services from '../../../extension/service'
import { twitterBase } from '../base'
import { getAvatar, getBio, getNickname, getTwitterId, getPersonalHomepage } from '../utils/user'
import { isMobileTwitter } from '../utils/isMobile'

function resolveLastRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = () => {
        const avatar = searchSelfAvatarSelector().evaluate()?.getAttribute('src') ?? ''
        const handle = searchSelfHandleSelector().evaluate()?.textContent?.trim()?.replace(/^@/, '')
        const nickname = searchSelfNicknameSelector().evaluate()?.textContent?.trim() ?? ''

        if (handle) {
            ref.value = {
                avatar,
                nickname,
                identifier: new ProfileIdentifier(twitterBase.networkIdentifier, handle),
            }
        }
    }
    const watcher = new MutationObserverWatcher(searchSelfHandleSelector())
        .addListener('onAdd', () => assign())
        .addListener('onChange', () => assign())
        .startWatch({
            childList: true,
            subtree: true,
        })
    cancel.addEventListener('abort', () => watcher.stopWatch())
}

function resolveLastRecognizedIdentityMobileInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const onLocationChange = async () => {
        const settings = await Twitter.getSettings()

        if (settings?.screen_name && (!ref.value.identifier || ref.value.identifier.isUnknown)) {
            ref.value = {
                ...ref.value,
                identifier: new ProfileIdentifier(twitterBase.networkIdentifier, settings.screen_name),
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
        await delay(500)
        const bio = getBio()
        const homepage = getPersonalHomepage()
        const nickname = getNickname()
        const handle = getTwitterId()
        const avatar = getAvatar()
        ref.value = {
            identifier: new ProfileIdentifier(twitterBase.networkIdentifier, handle),
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

        window.addEventListener('locationchange', assign)
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
        if (isMobileTwitter()) resolveLastRecognizedIdentityMobileInner(this.recognized, cancel)
    },
}

export const CurrentVisitingIdentityProviderTwitter: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, cancel)
    },
}
