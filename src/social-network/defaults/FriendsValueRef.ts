import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import { SocialNetworkUI } from '../ui'
import { Profile } from '../../database'

function hasFingerprint(x: Profile) {
    return !!x.fingerprint
}
export function InitFriendsValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.friendsRef
    Services.People.queryPeople(network).then(p => (ref.value = p.filter(hasFingerprint)))
    MessageCenter.on('peopleChanged', async events => {
        let next = [...ref.value]
        for (const event of events) {
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
                if (event.of.identifier.network === network) {
                    next.push(event.of)
                }
            } else {
                throw new Error('Invalid state')
            }
        }
        ref.value = next
    })
}
