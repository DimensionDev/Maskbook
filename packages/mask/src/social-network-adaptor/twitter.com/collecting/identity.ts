import { isNil } from 'lodash-unified'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { selfInfoSelectors, searchAvatarSelector, searchAvatarMetaSelector } from '../utils/selector'
import { ProfileIdentifier } from '@masknet/shared-base'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import Services from '../../../extension/service'
import { twitterBase } from '../base'
import { getAvatar, getBioDescription, getNickname, getTwitterId, getPersonalHomepage } from '../utils/user'
import { delay } from '@masknet/shared-base'

function resolveLastRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const selfSelector = selfInfoSelectors().handle
    const assign = () => {
        const handle = selfInfoSelectors().handle.evaluate()
        const nickname = selfInfoSelectors().name.evaluate()
        const avatar = selfInfoSelectors().userAvatar.evaluate()
        if (!isNil(handle)) {
            ref.value = {
                identifier: new ProfileIdentifier(twitterBase.networkIdentifier, handle),
                nickname,
                avatar,
            }
        }
    }
    const watcher = new MutationObserverWatcher(selfSelector)
        .addListener('onAdd', () => assign())
        .addListener('onChange', () => assign())
        .startWatch({
            childList: true,
            subtree: true,
        })
    cancel.addEventListener('abort', () => watcher.stopWatch())
}

function resolveCurrentVisitingIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const avatarSelector = searchAvatarSelector()
    const avatarMetaSelector = searchAvatarMetaSelector()
    const assign = async () => {
        await delay(500)
        const bio = getBioDescription()
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

    createWatcher(avatarSelector)
    createWatcher(avatarMetaSelector)
}

export const IdentityProviderTwitter: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}

export const CurrentVisitingIdentityProviderTwitter: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, cancel)
    },
}
