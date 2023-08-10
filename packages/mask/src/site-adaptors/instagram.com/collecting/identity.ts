import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { delay } from '@masknet/kit'
import { ProfileIdentifier } from '@masknet/shared-base'
import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../site-adaptor-infra/index.js'
import { instagramBase } from '../base.js'
import { searchInstagramAvatarSelector } from '../utils/selector.js'
import { getAvatar, getBioDescription, getNickname, getPersonalHomepage, getUserId } from '../utils/user.js'

function resolveCurrentVisitingIdentityInner(
    ref: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
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
            identifier: ProfileIdentifier.of(instagramBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname,
            avatar,
            bio,
            homepage,
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
}

export const CurrentVisitingIdentityProviderInstagram: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, cancel)
    },
}
