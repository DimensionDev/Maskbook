import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import { GroupIdentifier, PersonIdentifier } from '../../database/type'
import { SocialNetworkUI } from '../ui'
import { Person } from '../../database'

function hasFingerprint(x: Person) {
    return !!x.fingerprint
}
export function InitFriendsValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.friendsRef
    Services.People.queryPeople(network).then(p => (ref.value = p.filter(hasFingerprint)))
    MessageCenter.on('newPerson', person => {
        const old = ref.value.filter(x => !x.identifier.equals(person.identifier))
        ref.value = [...old, person].filter(hasFingerprint)
    })
}
