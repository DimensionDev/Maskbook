import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import { SocialNetworkUI } from '../ui'

export function InitGroupsValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.groupsRef
    Services.People.queryUserGroups(network).then(p => (ref.value = p))
    MessageCenter.on('newGroup', group => {
        const old = ref.value.filter(x => !x.identifier.equals(group.identifier))
        ref.value = [...old, group]
    })
}
