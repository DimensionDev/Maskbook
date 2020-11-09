import { MaskMessage } from '../../utils/messages'
import Services from '../../extension/service'
import type { SocialNetworkUI } from '../ui'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import type { Profile } from '../../database'

export function InitMyIdentitiesValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.myIdentitiesRef
    query(network, ref)
    MaskMessage.events.personaChanged.on((e) => e.some((x) => x.owned) && query(network, ref))
}

function query(network: string, ref: ValueRef<readonly Profile[]>) {
    Services.Identity.queryMyProfiles(network).then((p) => (ref.value = p))
}
