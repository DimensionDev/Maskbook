import { GroupRecord, createUserGroupDatabase, updateUserGroupDatabase, queryUserGroupsDatabase } from '../group'
import { ProfileIdentifier, GroupIdentifier, PreDefinedVirtualGroupNames } from '../type'
import type { Profile } from '..'

export interface Group extends GroupRecord {
    avatar?: string
}

export function createFriendsGroup(who: ProfileIdentifier, groupId: string) {
    return createUserGroupDatabase(
        GroupIdentifier.getFriendsGroupIdentifier(who, groupId),
        // Put the raw special name in, then UI can display in their own language.
        groupId,
    )
}

export function createDefaultFriendsGroup(who: ProfileIdentifier) {
    return createFriendsGroup(who, PreDefinedVirtualGroupNames.friends)
}

export async function addProfileToFriendsGroup(group: GroupIdentifier, newMembers: (Profile | ProfileIdentifier)[]) {
    const memberList = newMembers.map((x) => (x instanceof ProfileIdentifier ? x : x.identifier)) as ProfileIdentifier[]
    await updateUserGroupDatabase({ identifier: group, members: memberList }, 'append')
}
export function removeProfileFromFriendsGroup(group: GroupIdentifier, removedFriend: (Profile | ProfileIdentifier)[]) {
    const friendList = removedFriend.map((x) =>
        x instanceof ProfileIdentifier ? x : x.identifier,
    ) as ProfileIdentifier[]
    return updateUserGroupDatabase({ identifier: group }, (r) => {
        r.members = r.members.filter((x) => !friendList.some((y) => y.equals(x)))
    })
}

export function queryUserGroups(network: string): Promise<Group[]> {
    return queryUserGroupsDatabase((r) => r.network === network)
}
