import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import { SocialNetworkUI } from '../ui'
import { ValueRef } from '@holoflows/kit/es'
import { Profile } from '../../database'

export function InitMyIdentitiesValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.myIdentitiesRef
    query(network, ref)
    MessageCenter.on('identityUpdated', () => query(network, ref))
}

function query(network: string, ref: ValueRef<Profile[]>) {
    Services.People.queryMyIdentities(network).then(p => (ref.value = p))
}
