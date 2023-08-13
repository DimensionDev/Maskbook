import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../site-adaptor-infra/index.js'
import { ProfileIdentifier } from '@masknet/shared-base'
import { instagramBase } from '../base.js'
import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { delay } from '@masknet/kit'
import { searchInstagramHandleSelector } from '../utils/selector.js'
import { getPersonalHomepage, getUserId, getAvatar } from '../utils/user.js'

function resolveLastRecognizedIdentityInner(
    ref: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const handleSelector = searchInstagramHandleSelector()
    const assign = async () => {
        await delay(500)
        const homepage = getPersonalHomepage()
        const handle = getUserId()
        const avatar = getAvatar()

        ref.value = {
            identifier: ProfileIdentifier.of(instagramBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname: handle,
            avatar,
            homepage,
        }
    }

    assign()

    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
        new MutationObserverWatcher(selector)
            .addListener('onAdd', () => assign())
            .addListener('onChange', () => assign())
            .startWatch(
                {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['href'],
                },
                cancel,
            )

        window.addEventListener('locationchange', assign, { signal: cancel })
    }
    createWatcher(handleSelector)
}

export const IdentityProviderInstagram: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    async start(signal) {
        resolveLastRecognizedIdentityInner(this.recognized, signal)
    },
    recognized: creator.EmptyIdentityResolveProviderState(),
}
