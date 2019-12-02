import { MessageCenter, UpdateEvent } from '../../utils/messages'
import Services from '../../extension/service'
import { SocialNetworkUI } from '../ui'
import { Profile } from '../../database'
import { ValueRef } from '@holoflows/kit/es'

function hasFingerprint(x: Profile) {
    return !!x.linkedPersona?.fingerprint
}
export function InitFriendsValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.friendsRef
    Services.Identity.queryProfiles(network).then(p => (ref.value = p.filter(hasFingerprint)))
    MessageCenter.on(
        'profilesChanged',
        createProfilesChangedListener(ref, x => x.of.identifier.network === network),
    )
}
export function createProfilesChangedListener(ref: ValueRef<Profile[]>, filter: (x: UpdateEvent<Profile>) => boolean) {
    return async (events: readonly UpdateEvent<Profile>[]) => {
        let next = [...ref.value]
        for (const event of events.filter(filter)) {
            if (event.reason === 'delete') {
                next = next.filter(x => !x.identifier.equals(event.of.identifier))
            } else if (event.reason === 'update') {
                next.forEach((current, index, arr) => {
                    if (current.identifier.equals(event.of.identifier)) {
                        arr[index] = event.of
                    }
                })
            } else if (event.reason === 'new') {
                next = next.filter(x => !x.identifier.equals(event.of.identifier))
                next.push(event.of)
            } else {
                throw new Error('Invalid state')
            }
        }
        ref.value = next
    }
}
