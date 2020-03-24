import Services from '../../extension/service'
import type { SocialNetworkUI } from '../ui'
import type { ValueRef } from '@holoflows/kit/es'
import type { Group } from '../../database'
import { GroupIdentifier, PreDefinedVirtualGroupNames, ProfileIdentifier } from '../../database/type'
import { createDataWithIdentifierChangedListener } from './createDataWithIdentifierChangedListener'
import { MessageCenter } from '../../utils/messages'

// TODO:
// groupIDs can be a part of network definitions
export function InitGroupsValueRef(
    self: SocialNetworkUI,
    network: string,
    groupIDs: string[] = [PreDefinedVirtualGroupNames.friends],
) {
    create(network, self.groupsRef, groupIDs)
    MessageCenter.on('identityCreated', () => create(network, self.groupsRef, groupIDs))
    MessageCenter.on('joinGroup', ({ group, newMembers }) => join(group, self.groupsRef, newMembers))
    MessageCenter.on(
        'groupsChanged',
        createDataWithIdentifierChangedListener(self.groupsRef, (x) => x.of.identifier.network === network),
    )
}

function join(groupIdentifier: GroupIdentifier, ref: ValueRef<Group[]>, members: ProfileIdentifier[]) {
    const group = ref.value.find((g) => g.identifier.equals(groupIdentifier))
    if (!group) {
        return
    }
    group.members = [...group.members, ...members.filter((member) => !group.members.some((m) => m.equals(member)))]
    ref.value = [...ref.value]
}

async function query(network: string, ref: ValueRef<Group[]>) {
    Services.UserGroup.queryUserGroups(network).then((p) => (ref.value = p))
}

async function create(network: string, ref: ValueRef<Group[]>, groupIDs: string[]) {
    type Pair = [ProfileIdentifier, GroupIdentifier]
    const [identities, groups] = await Promise.all([
        Services.Identity.queryMyProfiles(network),
        Services.UserGroup.queryUserGroups(network),
    ])
    const pairs = identities.flatMap(({ identifier }) =>
        groupIDs.map((groupID) => [identifier, GroupIdentifier.getFriendsGroupIdentifier(identifier, groupID)] as Pair),
    )

    await Promise.all(
        pairs.map(async ([userIdentifier, groupIdentifier]) => {
            if (!groups.some((group) => group.identifier.equals(groupIdentifier))) {
                await Services.UserGroup.createFriendsGroup(userIdentifier, groupIdentifier.groupID)
            }
        }),
    )
    await query(network, ref)
}
