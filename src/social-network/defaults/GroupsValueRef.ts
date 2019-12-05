import Services from '../../extension/service'
import { SocialNetworkUI } from '../ui'
import { ValueRef } from '@holoflows/kit/es'
import { Group } from '../../database'
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
}

async function query(network: string, ref: ValueRef<Group[]>) {
    Services.UserGroup.queryUserGroups(network).then(p => (ref.value = p))
    MessageCenter.on(
        'groupsChanged',
        createDataWithIdentifierChangedListener(ref, x => x.of.identifier.network === network),
    )
}

async function create(network: string, ref: ValueRef<Group[]>, groupIDs: string[]) {
    type Pair = [ProfileIdentifier, GroupIdentifier]
    const [identities, groups] = await Promise.all([
        Services.Identity.queryMyProfiles(network),
        Services.UserGroup.queryUserGroups(network),
    ])
    const pairs = identities.flatMap(({ identifier }) => {
        return groupIDs.map(
            groupID => [identifier, GroupIdentifier.getFriendsGroupIdentifier(identifier, groupID)] as Pair,
        )
    })

    await Promise.all(
        pairs.map(async ([userIdentifier, groupIdentifier]) => {
            if (!groups.some(group => group.identifier.equals(groupIdentifier))) {
                await Services.UserGroup.createFriendsGroup(userIdentifier, groupIdentifier.groupID)
            }
        }),
    )
    await query(network, ref)
}
