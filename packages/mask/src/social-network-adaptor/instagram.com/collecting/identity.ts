import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { delay } from '@dimensiondev/kit'
import { ProfileIdentifier } from '@masknet/shared-base'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import { instagramBase } from '../base'
import { searchInstagramAvatarSelector } from '../utils/selector'
import { getAvatar, getBioDescription, getNickname, getPersonalHomepage, getUserId } from '../utils/user'

function resolveCurrentVisitingIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const avatarSelector = searchInstagramAvatarSelector()
    const assign = async () => {
        await delay(500)
        const bio = getBioDescription()
        const homepage = getPersonalHomepage()
        const nickname = getNickname()
        const handle = getUserId()
        const avatar = getAvatar()

        ref.value = {
            identifier: new ProfileIdentifier(instagramBase.networkIdentifier, handle),
            nickname,
            avatar,
            bio,
            homepage,
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
}

export const CurrentVisitingIdentityProviderInstagram: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, cancel)
    },
}
