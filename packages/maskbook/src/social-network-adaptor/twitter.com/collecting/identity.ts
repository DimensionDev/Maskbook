import { isNil } from 'lodash-es'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import {
    selfInfoSelectors,
    searchAvatarSelector,
    searchLastLinkSelector,
    searchLastMetaSelector,
} from '../utils/selector'
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

function resolveCurrentVisitingIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const avatarSelector = searchAvatarSelector()
    const avatarLastMetaSelector = searchLastMetaSelector()
    const avatarLastLinkSelector = searchLastLinkSelector()
    const assign = async () => {
        await delay(3000)
        const bio = getBioDescription()
        const avatar = getAvatar()
        const handle = getTwitterId()
        const nickname = getNickname()

        ref.value = {
            identifier: new ProfileIdentifier(twitterBase.networkIdentifier, handle),
            nickname,
            avatar,
            bio,
        }
    }
    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
        const watcher = new MutationObserverWatcher(selector)
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

    createWatcher(avatarSelector)
    createWatcher(avatarLastMetaSelector)
    createWatcher(avatarLastLinkSelector)
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
