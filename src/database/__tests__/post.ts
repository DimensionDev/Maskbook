import uuid from 'uuid/v4'
import {
    PostRecord,
    createPostDB,
    queryPostDB,
    updatePostDB,
    createOrUpdatePostDB,
    queryPostsDB,
    deletePostCryptoKeyDB,
} from '../post'
import { ProfileIdentifier, PostIVIdentifier } from '../type'
import { generate_AES_GCM_256_Key } from '../../utils/crypto.subtle'
import { IdentifierMap } from '../IdentifierMap'

async function createPostRecord(
    postBy: ProfileIdentifier = new ProfileIdentifier(uuid(), uuid()),
    identifier: PostIVIdentifier = new PostIVIdentifier(uuid(), uuid()),
) {
    return {
        postBy,
        identifier,
        postCryptoKey: await generate_AES_GCM_256_Key(),
        recipients: new IdentifierMap(new Map()),
        recipientGroups: [],
        foundAt: new Date(),
    } as PostRecord
}

test('createPostDB & queryPostDB', async () => {
    const postRecord = await createPostRecord()
    await createPostDB(postRecord)
    expect(await queryPostDB(postRecord.identifier)).toEqual(postRecord)
})

test('updatePostDB', async () => {
    const postRecord = await createPostRecord()
    const postRecordNew = await createPostRecord()
    postRecordNew.identifier = postRecord.identifier
    await createPostDB(postRecord)
    await updatePostDB(postRecordNew, 'append')
    expect(await queryPostDB(postRecord.identifier)).toEqual(postRecordNew)
})

test('createOrUpdatePostDB', async () => {
    const postRecord = await createPostRecord()
    const postRecordNew = await createPostRecord()
    postRecordNew.identifier = postRecord.identifier

    expect(await queryPostDB(postRecord.identifier)).toBe(null)

    await createOrUpdatePostDB(postRecord, 'append')
    expect(await queryPostDB(postRecord.identifier)).toEqual(postRecord)

    await createOrUpdatePostDB(postRecordNew, 'append')
    expect(await queryPostDB(postRecord.identifier)).toEqual(postRecordNew)
})

test('queryPostsDB', async () => {
    const postRecordA = await createPostRecord()
    const postRecordB = await createPostRecord()
    const networks = [postRecordA.identifier.network, postRecordB.identifier.network]
    const predicate = ({ identifier }: PostRecord) => networks.includes(identifier.network)

    await createPostDB(postRecordA)
    await createPostDB(postRecordB)
    expect(await queryPostsDB(postRecordA.identifier.network)).toEqual([postRecordA])
    expect((await queryPostsDB(predicate)).every(predicate)).toBeTruthy()
})

test('deletePostCryptoKeyDB', async () => {
    const postRecord = await createPostRecord()
    await createPostDB(postRecord)
    expect(await queryPostDB(postRecord.identifier)).toEqual(postRecord)

    await deletePostCryptoKeyDB(postRecord.identifier)
    expect(await queryPostDB(postRecord.identifier)).toEqual(null)
})
