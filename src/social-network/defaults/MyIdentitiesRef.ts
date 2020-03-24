import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import type { SocialNetworkUI } from '../ui'
import type { ValueRef } from '@holoflows/kit/es'
import type { Profile } from '../../database'

export function InitMyIdentitiesValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.myIdentitiesRef
    query(network, ref)
    MessageCenter.on('identityUpdated', () => query(network, ref))
}

function query(network: string, ref: ValueRef<Profile[]>) {
    Services.Identity.queryMyProfiles(network).then((p) => (ref.value = p))
}
