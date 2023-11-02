import { ProfileIdentifier } from '@masknet/shared-base'
import type { SiteAdaptorUI } from '@masknet/types'
import { Minds } from '@masknet/web3-providers'
import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { creator } from '../../../site-adaptor-infra/index.js'
import { mindsBase } from '../base.js'
import { handleSelector, selfInfoSelectors } from '../utils/selector.js'

async function resolveLastRecognizedIdentityInner(
    ref: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    async function assign() {
        const { handle, avatar } = selfInfoSelectors()

        ref.value = {
            identifier: ProfileIdentifier.of(mindsBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname: undefined,
            avatar,
        }
        const user = await Minds.getUserByScreenName(handle)

        if (user) {
            ref.value = {
                identifier: ProfileIdentifier.of(mindsBase.networkIdentifier, user.username).unwrapOr(undefined),
                nickname: user.name,
                avatar: user.avatar_url?.medium,
            }
        }
    }
    function createWatcher(selector: LiveSelector<HTMLElement, boolean>) {
        new MutationObserverWatcher(selector)
            .addListener('onAdd', () => assign())
            .addListener('onChange', () => assign())
            .startWatch(
                {
                    childList: true,
                    subtree: true,
                },
                cancel,
            )
    }
    assign()
    createWatcher(handleSelector())
}

export const IdentityProviderMinds: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}
