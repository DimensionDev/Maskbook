import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import type { SocialNetworkUI } from '../ui'
import type { Profile, Group } from '../../database'
import { createDataWithIdentifierChangedListener } from './createDataWithIdentifierChangedListener'

function hasFingerprint(x: Profile) {
    return !!x.linkedPersona?.fingerprint
}
export function InitFriendsValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.friendsRef
    Services.Identity.queryProfiles(network).then((p) => (ref.value = p.filter(hasFingerprint)))
    MessageCenter.on(
        'profilesChanged',
        createDataWithIdentifierChangedListener(ref, (x) => x.of.identifier.network === network),
    )
}
