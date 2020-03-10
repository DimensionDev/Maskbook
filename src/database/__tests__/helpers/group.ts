import uuid from 'uuid/v4'
import { ProfileIdentifier, GroupIdentifier, PreDefinedVirtualGroupNames } from '../../type'
import {
    createFriendsGroup,
    queryUserGroups,
    addProfileToFriendsGroup,
    removeProfileFromFriendsGroup,
} from '../../helpers/group'
import { queryUserGroupDatabase } from '../../group'

function createProfileIdentifier(network = uuid(), userId = uuid()) {
    return new ProfileIdentifier(network, userId)
}

function createGroupIdentifier(network = uuid(), owner = uuid(), groupId = uuid()) {
    return new GroupIdentifier(network, owner, groupId)
}

test('createFriendsGroup', async () => {
    const groupId = uuid()
    const profileIdentifier = createProfileIdentifier()
    const groupIdentifier = createGroupIdentifier(profileIdentifier.network, profileIdentifier.userId, groupId)
    await createFriendsGroup(profileIdentifier, groupId)
    expect(await queryUserGroupDatabase(groupIdentifier)).toBeTruthy()
})

test('createDefaultFriendsGroup', async () => {
    const groupId = PreDefinedVirtualGroupNames.friends
    const profileIdentifier = createProfileIdentifier()
    const groupIdentifier = createGroupIdentifier(profileIdentifier.network, profileIdentifier.userId, groupId)
    await createFriendsGroup(profileIdentifier, groupId)
    expect(await queryUserGroupDatabase(groupIdentifier)).toBeTruthy()
})

test('addProfileToFriendsGroup & removeProfileFromFriendsGroup', async () => {
    const groupId = uuid()
    const ownerIdentifier = createProfileIdentifier()
    const profileIdentifierA = createProfileIdentifier()
    const profileIdentifierB = createProfileIdentifier()
    const groupIdentifier = createGroupIdentifier(ownerIdentifier.network, ownerIdentifier.userId, groupId)

    await createFriendsGroup(ownerIdentifier, groupId)
    expect((await queryUserGroupDatabase(groupIdentifier))?.members.length).toBe(0)

    await addProfileToFriendsGroup(groupIdentifier, [profileIdentifierA, profileIdentifierB])
    expect((await queryUserGroupDatabase(groupIdentifier))?.members.length).toBe(2)

    await removeProfileFromFriendsGroup(groupIdentifier, [profileIdentifierA, profileIdentifierB])
    expect((await queryUserGroupDatabase(groupIdentifier))?.members.length).toBe(0)
})

test('queryUserGroups', async () => {
    const groupId = uuid()
    const profileIdentifier = createProfileIdentifier()
    await createFriendsGroup(profileIdentifier, groupId)
    expect((await queryUserGroups(profileIdentifier.network)).length).toBe(1)
})
