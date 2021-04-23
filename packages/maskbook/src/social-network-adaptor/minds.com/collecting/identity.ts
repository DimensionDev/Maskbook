import { ProfileIdentifier } from '../../../database/type'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import { mindsBase } from '../base'
import { selfInfoSelectors } from '../utils/selector'

function resolveLastRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['lastRecognized'],
    cancel: AbortSignal,
) {
    const handle = selfInfoSelectors().handle.evaluate()

    fetch('/api/v1/channel/' + handle, { signal: cancel })
        .then((res) => res.json())
        .then(({ channel }) => {
            ref.value = {
                identifier: new ProfileIdentifier(mindsBase.networkIdentifier, channel.username),
                nickname: channel.name,
                avatar: channel.avatar_url?.medium,
            }
        })
}

export const IdentityProviderMinds: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    lastRecognized: creator.IdentityResolveProviderLastRecognized(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.lastRecognized, cancel)
    },
}
