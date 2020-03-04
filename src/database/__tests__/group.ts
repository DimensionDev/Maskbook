import uuid from 'uuid/v4'
import {
    GroupRecord,
    createUserGroupDatabase,
    queryUserGroupDatabase,
    queryUserGroupsDatabase,
    createOrUpdateUserGroupDatabase,
    deleteUserGroupDatabase,
    updateUserGroupDatabase,
} from '../group'
import { GroupIdentifier } from '../type'

function createGroupRecord() {
    const identifier = new GroupIdentifier(uuid(), uuid(), uuid())
    return {
        groupName: uuid(),
        identifier,
        members: [],
        banned: undefined,
    } as GroupRecord
}

function groupRecordToDB(groupRecord: GroupRecord) {
    return {
        ...groupRecord,
        network: groupRecord.identifier.network,
    }
}

test('createUserGroupDatabase & queryUserGroupDatabase', async () => {
    const groupRecord = createGroupRecord()
    await createUserGroupDatabase(groupRecord.identifier, groupRecord.groupName)
    expect(await queryUserGroupDatabase(groupRecord.identifier)).toEqual(groupRecordToDB(groupRecord))
})

test('createOrUpdateUserGroupDatabase', async () => {
    const groupRecord = createGroupRecord()
    const groupRecordNew = createGroupRecord()
    groupRecordNew.identifier = groupRecord.identifier

    expect(await queryUserGroupDatabase(groupRecord.identifier)).toBe(null)

    await createOrUpdateUserGroupDatabase(groupRecord, 'replace')
    expect(await queryUserGroupDatabase(groupRecord.identifier)).toEqual(groupRecordToDB(groupRecord))

    await createOrUpdateUserGroupDatabase(groupRecordNew, 'replace')
    expect(await queryUserGroupDatabase(groupRecord.identifier)).toEqual(groupRecordToDB(groupRecordNew))
})

test('deleteUserGroupDatabase', async () => {
    const groupRecord = createGroupRecord()
    expect(await queryUserGroupDatabase(groupRecord.identifier)).toBe(null)

    await createUserGroupDatabase(groupRecord.identifier, groupRecord.groupName)
    expect(await queryUserGroupDatabase(groupRecord.identifier)).toEqual(groupRecordToDB(groupRecord))

    await deleteUserGroupDatabase(groupRecord.identifier)
    expect(await queryUserGroupDatabase(groupRecord.identifier)).toBe(null)
})

test('updateUserGroupDatabase', async () => {
    const groupRecord = createGroupRecord()
    const groupRecordNew = createGroupRecord()
    groupRecordNew.identifier = groupRecord.identifier

    await createUserGroupDatabase(groupRecord.identifier, groupRecord.groupName)
    expect(await queryUserGroupDatabase(groupRecord.identifier)).toEqual(groupRecordToDB(groupRecord))

    await updateUserGroupDatabase(groupRecordNew, 'replace')
    expect(await queryUserGroupDatabase(groupRecord.identifier)).toEqual(groupRecordToDB(groupRecordNew))
})

test('queryUserGroupsDatabase', async () => {
    const groupRecordA = createGroupRecord()
    const groupRecordB = createGroupRecord()
    const networks = [groupRecordA.identifier.network, groupRecordB.identifier.network]
    await createUserGroupDatabase(groupRecordA.identifier, groupRecordA.groupName)
    await createUserGroupDatabase(groupRecordB.identifier, groupRecordB.groupName)
    expect(await queryUserGroupsDatabase({ network: groupRecordA.identifier.network })).toEqual([
        groupRecordToDB(groupRecordA),
    ])
    expect(await queryUserGroupsDatabase({ network: groupRecordB.identifier.network })).toEqual([
        groupRecordToDB(groupRecordB),
    ])
    expect(await queryUserGroupsDatabase(key => networks.includes(key.network))).toBeTruthy()
})
