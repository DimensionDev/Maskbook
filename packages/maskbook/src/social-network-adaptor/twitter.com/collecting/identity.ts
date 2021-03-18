import { selfInfoSelectors } from '../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier } from '../../../database/type'
import type { SocialNetworkUI } from '../../../social-network'
import { isNil } from 'lodash-es'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import { twitterBase } from '../base'

function resolveLastRecognizedIdentityInner(
    ref: Next.CollectingCapabilities.IdentityResolveProvider['lastRecognized'],
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

export const IdentityProviderTwitter: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    lastRecognized: creator.IdentityResolveProviderLastRecognized(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.lastRecognized, cancel)
    },
}
