import { GroupRecord, createUserGroupDatabase, updateUserGroupDatabase, queryUserGroupsDatabase } from '../group'
import { PersonIdentifier, GroupIdentifier, PreDefinedVirtualGroupNames } from '../type'
import { Person } from './person'

export interface Group extends GroupRecord {
    avatar?: string
}

export function createDefaultFriendsGroup(who: PersonIdentifier) {
    return createUserGroupDatabase(
        GroupIdentifier.getDefaultFriendsGroupIdentifier(who),
        // Put the raw special name in, then UI can display in their own language.
        PreDefinedVirtualGroupNames.friends,
    )
}

export async function addPersonToFriendsGroup(group: GroupIdentifier, newMembers: (Person | PersonIdentifier)[]) {
    const memberList = newMembers.map(x => (x instanceof PersonIdentifier ? x : x.identifier)) as PersonIdentifier[]
    await updateUserGroupDatabase({ identifier: group, members: memberList }, 'append')
}
export function removePersonFromFriendsGroup(group: GroupIdentifier, removedFriend: (Person | PersonIdentifier)[]) {
    const friendList = removedFriend.map(x => (x instanceof PersonIdentifier ? x : x.identifier)) as PersonIdentifier[]
    return updateUserGroupDatabase({ identifier: group }, r => {
        r.members = r.members.filter(x => !friendList.some(y => y.equals(x)))
    })
}

export function queryUserGroups(network: string): Promise<Group[]> {
    return queryUserGroupsDatabase(r => r.network === network)
}
