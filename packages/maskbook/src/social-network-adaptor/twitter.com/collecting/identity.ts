import { isNil } from 'lodash-es'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { selfInfoSelectors, searchProfileTabListSelector } from '../utils/selector'
import { ProfileIdentifier } from '../../../database/type'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import { twitterBase } from '../base'
import { getAvatar, getBioDescription, getNickname, getTwitterId } from '../utils/user'
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

function resolveSurfaceRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const headerPhotoSelector = searchProfileTabListSelector()
    const assign = async () => {
        await delay(500)
        const bio = getBioDescription()
        const nickname = getNickname()
        const handle = getTwitterId()
        const avatar = getAvatar()
        ref.value = {
            identifier: new ProfileIdentifier(twitterBase.networkIdentifier, handle),
            nickname,
            avatar,
            bio,
        }
    }

    const watcher = new MutationObserverWatcher(headerPhotoSelector)
        .addListener('onAdd', () => assign())
        .addListener('onChange', () => assign())
        .startWatch({
            childList: true,
            subtree: true,
        })

    window.addEventListener('locationchange', assign)
    cancel.addEventListener('abort', () => {
        window.removeEventListener('locationchange', assign)
        watcher.stopWatch()
    })
}

export const IdentityProviderTwitter: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.IdentityResolveProviderLastRecognized(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}

export const SurfaceIdentityProviderTwitter: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.IdentityResolveProviderSurfaceRecognized(),
    start(cancel) {
        resolveSurfaceRecognizedIdentityInner(this.recognized, cancel)
    },
}
