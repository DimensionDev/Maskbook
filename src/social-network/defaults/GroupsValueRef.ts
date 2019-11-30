import Services from '../../extension/service'
import { SocialNetworkUI } from '../ui'
import { ValueRef } from '@holoflows/kit/es'
import { Group } from '../../database'
import { GroupIdentifier, PreDefinedVirtualGroupNames, PersonIdentifier } from '../../database/type'

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
    ref.value = await Services.People.queryUserGroups(network)
}

async function create(network: string, ref: ValueRef<Group[]>, groupIDs: string[]) {
    type Pair = [PersonIdentifier, GroupIdentifier]
    const [identities, groups] = await Promise.all([
        Services.People.queryMyIdentities(network),
        Services.People.queryUserGroups(network),
    ])
    const pairs = identities.reduce<Pair[]>(
        (acc, identity) => [
            ...acc,
            ...groupIDs.map(
                groupID =>
                    [
                        identity.identifier,
                        GroupIdentifier.getFriendsGroupIdentifier(identity.identifier, groupID),
                    ] as Pair,
            ),
        ],
        [],
    )

    await Promise.all(
        pairs.map(async ([userIdentifier, groupIdentifier]) => {
            if (!groups.some(group => group.identifier.equals(groupIdentifier))) {
                await Services.People.createFriendsGroup(userIdentifier, groupIdentifier.groupID)
            }
        }),
    )
    await query(network, ref)
}
