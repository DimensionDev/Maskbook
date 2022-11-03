import { ProfileIdentifier } from '@masknet/shared-base'
import { SocialNetworkUI as Next, CREATOR } from '@masknet/social-network-infra'
import { mindsBase } from '../base.js'
import { handleSelector, selfInfoSelectors } from '../utils/selector.js'
import { Minds } from '@masknet/web3-providers'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'

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
    recognized: CREATOR.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}
