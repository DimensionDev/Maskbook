import { GroupRecord, createUserGroupDatabase, updateUserGroupDatabase, queryUserGroupsDatabase } from '../group'
import { PersonIdentifier, GroupIdentifier, PreDefinedVirtualGroupNames } from '../type'
import { Person } from './person'

export interface Group extends GroupRecord {
    avatar?: string
}

export function createFriendsGroup(who: PersonIdentifier, groupId: string) {
    return createUserGroupDatabase(
        GroupIdentifier.getFriendsGroupIdentifier(who, groupId),
        // Put the raw special name in, then UI can display in their own language.
        groupId,
    )
}

export function createDefaultFriendsGroup(who: PersonIdentifier) {
    return createFriendsGroup(who, PreDefinedVirtualGroupNames.friends)
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
