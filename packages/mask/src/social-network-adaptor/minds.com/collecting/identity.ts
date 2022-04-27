import { waitDocumentReadyState } from '@dimensiondev/kit'
import { ProfileIdentifier } from '@masknet/shared-base'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import { untilElementAvailable } from '../../../utils/dom'
import { mindsBase } from '../base'
import { handleSelector, selfInfoSelectors } from '../utils/selector'

async function resolveLastRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    await waitDocumentReadyState('interactive')
    await untilElementAvailable(handleSelector())
    const handle = selfInfoSelectors().handle.evaluate()
    const avatar = selfInfoSelectors().avatar.evaluate()

    if (handle) {
        // get handle and avatar from the user menu
        ref.value = {
            identifier: ProfileIdentifier.of(mindsBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname: undefined,
            avatar,
        }

        // call the API to get the nickname
        fetch('/api/v1/channel/' + handle, { signal: cancel })
            .then((res) => res.json())
            .then(({ channel }) => {
                ref.value = {
                    identifier: ProfileIdentifier.of(mindsBase.networkIdentifier, channel.username).unwrapOr(undefined),
                    nickname: channel.name,
                    avatar: channel.avatar_url?.medium,
                }
            })
    }
}

export const IdentityProviderMinds: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}
