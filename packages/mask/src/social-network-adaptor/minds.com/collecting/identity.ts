import { ProfileIdentifier } from '@masknet/shared-base'
import type { SocialNetworkUI as Next } from '@masknet/social-network-infra'
import { Minds } from '@masknet/web3-providers'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { creator } from '../../../social-network/index.js'
import { mindsBase } from '../base.js'
import { handleSelector, selfInfoSelectors } from '../utils/selector.js'

async function resolveLastRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        const handle = selfInfoSelectors().handle.evaluate()
        const avatar = selfInfoSelectors().avatar.evaluate()

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
    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
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

export const IdentityProviderMinds: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}
