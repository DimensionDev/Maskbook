import { v4 as uuid } from 'uuid'
import {
    storeAvatarDB,
    queryAvatarDB,
    updateAvatarMetaDB,
    queryAvatarOutdatedDB,
    isAvatarOutdatedDB,
    deleteAvatarsDB,
} from '../avatar'
import { ProfileIdentifier } from '../type'

function createBeforeDate(beforeDays: number) {
    return new Date(Date.now() - 1000 * 60 * 60 * 24 * beforeDays)
}

function createProfileIdentifier() {
    return new ProfileIdentifier(uuid(), uuid())
}

function createArrayBuffer(length: number) {
    return new Uint8Array(
        Array.from({ length })
            .fill(0)
            .map(() => Math.round(Math.random() * 256)),
    ).buffer
}

test('storeAvatarDB & queryAvatarDB', async () => {
    const ab = createArrayBuffer(20)
    const profileIdentifier = createProfileIdentifier()

    await storeAvatarDB(profileIdentifier, ab)
    expect(await queryAvatarDB(profileIdentifier)).toEqual(ab)
})

test('updateAvatarMetaDB & queryAvatarOutdatedDB', async () => {
    const ab = createArrayBuffer(20)
    const profileIdentifierA = createProfileIdentifier()
    const profileIdentifierB = createProfileIdentifier()
    await storeAvatarDB(profileIdentifierA, ab)
    await storeAvatarDB(profileIdentifierB, ab)
    await updateAvatarMetaDB(profileIdentifierA, {
        lastAccessTime: createBeforeDate(15),
    })
    await updateAvatarMetaDB(profileIdentifierB, {
        lastUpdateTime: createBeforeDate(8),
    })
    expect(await queryAvatarOutdatedDB('lastAccessTime')).toEqual([profileIdentifierA])
    expect(await queryAvatarOutdatedDB('lastUpdateTime')).toEqual([profileIdentifierB])
})

test('updateAvatarMetaDB & isAvatarOutdatedDB', async () => {
    const ab = createArrayBuffer(20)
    const profileIdentifier = createProfileIdentifier()
    await storeAvatarDB(profileIdentifier, ab)
    expect(await isAvatarOutdatedDB(profileIdentifier, 'lastAccessTime')).toBeFalsy()
    expect(await isAvatarOutdatedDB(profileIdentifier, 'lastUpdateTime')).toBeFalsy()

    await updateAvatarMetaDB(profileIdentifier, {
        lastAccessTime: createBeforeDate(31),
    })
    expect(await isAvatarOutdatedDB(profileIdentifier, 'lastAccessTime')).toBeTruthy()

    await updateAvatarMetaDB(profileIdentifier, {
        lastUpdateTime: createBeforeDate(8),
    })
    expect(await isAvatarOutdatedDB(profileIdentifier, 'lastUpdateTime')).toBeTruthy()
})

test('deleteAvatarsDB', async () => {
    const ab = createArrayBuffer(20)
    const profileIdentifier = createProfileIdentifier()

    expect(await queryAvatarDB(profileIdentifier)).toBe(null)

    await storeAvatarDB(profileIdentifier, ab)
    expect(await queryAvatarDB(profileIdentifier)).toEqual(ab)

    await deleteAvatarsDB([profileIdentifier])
    expect(await queryAvatarDB(profileIdentifier)).toEqual(null)
})
