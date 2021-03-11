import { selfInfoSelectors } from '../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier } from '../../../database/type'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { isNil } from 'lodash-es'

export function resolveLastRecognizedIdentity(self: SocialNetworkUI) {
    const selfSelector = selfInfoSelectors().handle
    const assign = () => {
        const ref = self.lastRecognizedIdentity
        const handle = selfInfoSelectors().handle.evaluate()
        const nickname = selfInfoSelectors().name.evaluate()
        const avatar = selfInfoSelectors().userAvatar.evaluate()
        if (!isNil(handle)) {
            ref.value = {
                identifier: new ProfileIdentifier(self.networkIdentifier, handle),
                nickname,
                avatar,
            }
        }
    }
    new MutationObserverWatcher(selfSelector)
        .addListener('onAdd', () => assign())
        .addListener('onChange', () => assign())
        .startWatch({
            childList: true,
            subtree: true,
        })
}
