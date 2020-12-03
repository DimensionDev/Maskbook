import Services from '../../extension/service'
import type { SocialNetworkUI } from '../ui'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import type { Group } from '../../database'
import { GroupIdentifier, PreDefinedVirtualGroupNames, ProfileIdentifier } from '../../database/type'
import { MaskMessage } from '../../utils/messages'
import { debounce } from 'lodash-es'
import { enableGroupSharingSettings } from '../../settings/settings'

// TODO:
// groupIDs can be a part of network definitions
export async function InitGroupsValueRef(
    self: SocialNetworkUI,
    network: string,
    groupIDs: string[] = [PreDefinedVirtualGroupNames.friends],
) {
    if (!(await enableGroupSharingSettings.readyPromise)) return
    const createUserGroup = debounce(create, 1000, {
        trailing: true,
    })
    const onJoin = debounce(join, 1000, {
        trailing: true,
    })
    createUserGroup(network, self.groupsRef, groupIDs)
    MaskMessage.events.personaChanged.on((e) => {
        if (e.some((x) => x.owned)) createUserGroup(network, self.groupsRef, groupIDs)
    })
    MaskMessage.events.profileJoinedGroup.on(({ group, newMembers }) => onJoin(group, self.groupsRef, newMembers))
}

function join(groupIdentifier: GroupIdentifier, ref: ValueRef<readonly Group[]>, members: ProfileIdentifier[]) {
    const group = ref.value.find((g) => g.identifier.equals(groupIdentifier))
    if (!group) {
        return
    }
    group.members = [...group.members, ...members.filter((member) => !group.members.some((m) => m.equals(member)))]
    ref.value = [...ref.value]
}

async function query(network: string, ref: ValueRef<readonly Group[]>) {
    Services.UserGroup.queryUserGroups(network).then((p) => (ref.value = p))
}

async function create(network: string, ref: ValueRef<readonly Group[]>, groupIDs: string[]) {
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
