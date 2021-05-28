import { v4 as uuid } from 'uuid'
import {
    queryPersona,
    profileRecordToProfile,
    personaRecordToPersona,
    queryProfile,
    queryProfilesWithQuery,
    queryPersonasWithQuery,
    renamePersona,
    queryPersonaByProfile,
    queryPersonaRecord,
    queryPublicKey,
    queryLocalKey,
    queryPrivateKey,
    createProfileWithPersona,
    deletePersona,
} from '../../Persona/helpers'
import { queryPersonaDB, createProfileDB, createPersonaDB, queryProfileDB } from '../../Persona/Persona.db'
import { createPersonaRecord, createProfileRecord, personaDBWriteAccess } from './Persona.db'
import { storeAvatarDB } from '../../avatar'

beforeAll(() => {
    // MessageCenter will dispatch events on each tab
    // but default query method returns undefined
    browser.tabs.query = async () => {
        return []
    }
})

afterEach(async () => {
    await personaDBWriteAccess(async (t) => {
        await t.objectStore('personas').clear()
        await t.objectStore('profiles').clear()
    })
})

test('profileRecordToProfile', async () => {
    const profileRecord = await createProfileRecord()
    await storeAvatarDB(profileRecord.identifier, new ArrayBuffer(20))

    const profile = await profileRecordToProfile(profileRecord)
    expect(profile.avatar).toBe('data:image/png;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAA=')
    expect(profile.linkedPersona?.identifier).toEqual(profileRecord.linkedPersona)
})

test('personaRecordToPersona', async () => {
    const personaRecord = await createPersonaRecord()
    const persona = personaRecordToPersona(personaRecord)

    expect(persona.hasPrivateKey).toBe(true)
    expect(persona.fingerprint).toBe(personaRecord.identifier.compressedPoint)
})

test('queryProfile', async () => {
    const profileRecord = await createProfileRecord()
    const fake = await queryProfile(profileRecord.identifier)
    expect(fake.avatar).toBe(undefined)
    expect(fake.linkedPersona).toBe(undefined)

    await storeAvatarDB(profileRecord.identifier, new ArrayBuffer(20))
    await personaDBWriteAccess((t) => createProfileDB(profileRecord, t))

    const real = await queryProfile(profileRecord.identifier)
    expect(real.avatar).toBe('data:image/png;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAA=')
    expect(real.linkedPersona?.identifier).toEqual(profileRecord.linkedPersona)
})

test('queryPersona', async () => {
    const personaRecord = await createPersonaRecord()
    const fake = await queryPersona(personaRecord.identifier)
    expect(fake.hasPrivateKey).toBe(false)
    expect(fake.fingerprint).toBe(personaRecord.identifier.compressedPoint)

    await personaDBWriteAccess((t) => createPersonaDB(personaRecord, t))

    const real = await queryPersona(personaRecord.identifier)
    expect(real.hasPrivateKey).toBe(true)
    expect(real.fingerprint).toBe(personaRecord.identifier.compressedPoint)
})

test('queryProfilesWithQuery', async () => {
    const profileRecordA = await createProfileRecord()
    const profileRecordB = await createProfileRecord()
    const names = [profileRecordA.nickname, profileRecordB.nickname]

    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecordA, t)
        await createProfileDB(profileRecordB, t)
    })

    const profiles = await queryProfilesWithQuery(({ nickname }) => names.includes(nickname))
    expect(profiles.every((p) => names.includes(p.nickname))).toBe(true)
})

test('queryPersonasWithQuery', async () => {
    const personaRecordA = await createPersonaRecord()
    const personaRecordB = await createPersonaRecord()
    const names = [personaRecordA.nickname, personaRecordB.nickname]

    await personaDBWriteAccess(async (t) => {
        await createPersonaDB(personaRecordA, t)
        await createPersonaDB(personaRecordB, t)
    })

    const personas = await queryPersonasWithQuery(({ nickname }) => names.includes(nickname))
    expect(personas.every((p) => names.includes(p.nickname))).toBe(true)
})

test('deletePersona', async () => {
    const personaRecord = await createPersonaRecord()
    await personaDBWriteAccess((t) => createPersonaDB(personaRecord, t))
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(personaRecord)

    await deletePersona(personaRecord.identifier, 'delete even with private')
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(null)
})

test('renamePersona', async () => {
    const name = uuid()
    const personaRecord = await createPersonaRecord()

    await personaDBWriteAccess((t) => createPersonaDB(personaRecord, t))
    await renamePersona(personaRecord.identifier, name)
    expect((await queryPersonaDB(personaRecord.identifier))?.nickname).toBe(name)
})

test('queryPersonaByProfile', async () => {
    const profileRecord = await createProfileRecord()
    const personaRecord = await createPersonaRecord()
    profileRecord.linkedPersona = personaRecord.identifier
    personaRecord.linkedProfiles.set(profileRecord.identifier, {
        connectionConfirmState: 'confirmed',
    })
    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecord, t)
        await createPersonaDB(personaRecord, t)
    })
    expect(await queryPersonaByProfile(profileRecord.identifier)).toEqual(personaRecordToPersona(personaRecord))
})

test('queryPersonaRecord', async () => {
    const profileRecord = await createProfileRecord()
    const personaRecord = await createPersonaRecord()
    profileRecord.linkedPersona = personaRecord.identifier
    personaRecord.linkedProfiles.set(profileRecord.identifier, {
        connectionConfirmState: 'confirmed',
    })
    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecord, t)
        await createPersonaDB(personaRecord, t)
    })
    expect(await queryPersonaRecord(profileRecord.identifier)).toEqual(personaRecord)
    expect(await queryPersonaRecord(personaRecord.identifier)).toEqual(personaRecord)
})

test('queryPublicKey', async () => {
    const profileRecord = await createProfileRecord()
    const personaRecord = await createPersonaRecord()
    const publicKey = personaRecord.publicKey
    profileRecord.linkedPersona = personaRecord.identifier
    personaRecord.linkedProfiles.set(profileRecord.identifier, {
        connectionConfirmState: 'confirmed',
    })
    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecord, t)
        await createPersonaDB(personaRecord, t)
    })
    expect(await queryPublicKey(profileRecord.identifier)).toEqual(publicKey)
    expect(await queryPublicKey(personaRecord.identifier)).toEqual(publicKey)
})

test('queryPrivateKey', async () => {
    const profileRecord = await createProfileRecord()
    const personaRecord = await createPersonaRecord()
    const privateKey = personaRecord.privateKey
    profileRecord.linkedPersona = personaRecord.identifier
    personaRecord.linkedProfiles.set(profileRecord.identifier, {
        connectionConfirmState: 'confirmed',
    })
    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecord, t)
        await createPersonaDB(personaRecord, t)
    })
    expect(await queryPrivateKey(profileRecord.identifier)).toEqual(privateKey)
    expect(await queryPrivateKey(personaRecord.identifier)).toEqual(privateKey)
})

test('createProfileWithPersona', async () => {
    const profileRecord = await createProfileRecord()
    const personaRecord = await createPersonaRecord()
    await createProfileWithPersona(
        profileRecord.identifier,
        {
            connectionConfirmState: 'confirmed',
        },
        personaRecord,
    )
    profileRecord.linkedPersona = personaRecord.identifier
    personaRecord.linkedProfiles.set(profileRecord.identifier, {
        connectionConfirmState: 'confirmed',
    })
    expect((await queryProfileDB(profileRecord.identifier))?.linkedPersona).toEqual(personaRecord.identifier)
    expect((await queryPersonaDB(personaRecord.identifier))?.identifier).toEqual(personaRecord.identifier)
})

test('queryLocalKey', async () => {
    const profileRecord = await createProfileRecord()
    const personaRecord = await createPersonaRecord()
    profileRecord.linkedPersona = personaRecord.identifier
    personaRecord.linkedProfiles.set(profileRecord.identifier, {
        connectionConfirmState: 'confirmed',
    })
    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecord, t)
        await createPersonaDB(personaRecord, t)
    })
    expect(await queryLocalKey(profileRecord.identifier)).toEqual(profileRecord.localKey)
    expect(await queryLocalKey(personaRecord.identifier)).toEqual(personaRecord.localKey)
})
