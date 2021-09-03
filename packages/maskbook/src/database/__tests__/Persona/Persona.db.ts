import { v4 as uuid } from 'uuid'
import { IdentifierMap } from '../../IdentifierMap'
import { ProfileIdentifier, ECKeyIdentifierFromJsonWebKey } from '../../type'
import {
    PersonaRecord,
    ProfileRecord,
    createPersonaDB,
    queryPersonaDB,
    FullPersonaDBTransaction,
    createPersonaDBAccess,
    queryPersonasDB,
    deletePersonaDB,
    updatePersonaDB,
    LinkedProfileDetails,
    createProfileDB,
    queryProfileDB,
    queryProfilesDB,
    updateProfileDB,
    createOrUpdateProfileDB,
    deleteProfileDB,
    attachProfileDB,
    queryPersonaByProfileDB,
    queryPersonasWithPrivateKey,
    createOrUpdatePersonaDB,
    safeDeletePersonaDB,
} from '../../Persona/Persona.db'
import { generate_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../../utils/mnemonic-code'
import { deriveLocalKeyFromECDHKey } from '../../../utils/mnemonic-code/localKeyGenerate'
import { createTransaction } from '../../helpers/openDB'

export async function createPersonaRecord(name: string = uuid(), password: string = uuid()) {
    const { key, mnemonicRecord: mnemonic } = await generate_ECDH_256k1_KeyPair_ByMnemonicWord(password)
    const { publicKey, privateKey } = key
    const localKey = await deriveLocalKeyFromECDHKey(publicKey, mnemonic.words)
    const identifier = ECKeyIdentifierFromJsonWebKey(publicKey)

    return {
        nickname: name,
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: identifier,
        linkedProfiles: new IdentifierMap<ProfileIdentifier, LinkedProfileDetails>(new Map(), ProfileIdentifier),
        publicKey,
        privateKey,
        mnemonic,
        localKey,
    } as PersonaRecord
}

export async function createProfileRecord(
    identifier: ProfileIdentifier = new ProfileIdentifier(uuid(), uuid()),
    name: string = uuid(),
    password: string = uuid(),
) {
    const { localKey, identifier: linkedPersona, createdAt, updatedAt } = await createPersonaRecord(name, password)

    return {
        identifier,
        nickname: name,
        localKey,
        linkedPersona,
        createdAt,
        updatedAt,
    } as ProfileRecord
}

export async function personaDBWriteAccess(action: (t: FullPersonaDBTransaction<'readwrite'>) => Promise<void>) {
    await action(createTransaction(await createPersonaDBAccess(), 'readwrite')('profiles', 'personas', 'relations'))
}

beforeAll(() => {
    // MessageCenter will dispatch events on each tab
    // but the mocking query method returns undefined
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

test('createPersonaDB & queryPersonaDB', async () => {
    const personaRecord = await createPersonaRecord()
    await personaDBWriteAccess((t) => createPersonaDB(personaRecord, t))
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(personaRecord)
})

test('queryPersonasDB', async () => {
    const personaRecordA = await createPersonaRecord()
    const personaRecordB = await createPersonaRecord()
    const names = [personaRecordA.nickname, personaRecordB.nickname]
    await personaDBWriteAccess(async (t) => {
        await createPersonaDB(personaRecordA, t)
        await createPersonaDB(personaRecordB, t)
    })

    const personaRecords = await queryPersonasDB((p) => !!(p.nickname && names.includes(p.nickname)))
    expect(personaRecords.length).toBe(2)
    expect(personaRecords.every((r) => names.includes(r.nickname ?? ''))).toBeTruthy()
})

test('updatePersonaDB - replace linked profiles', async () => {
    const id = uuid()
    const personaRecord = await createPersonaRecord(id, id)
    const personaRecordNew = await createPersonaRecord(id, id)
    personaRecordNew.identifier = personaRecord.identifier

    await personaDBWriteAccess(async (t) => {
        await createPersonaDB(personaRecord, t)
        await updatePersonaDB(
            personaRecordNew,
            {
                linkedProfiles: 'replace',
                explicitUndefinedField: 'ignore',
            },
            t,
        )
    })
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(personaRecordNew)
})

test('deletePersonaDB', async () => {
    const personaRecord = await createPersonaRecord()
    await personaDBWriteAccess((t) => createPersonaDB(personaRecord, t))
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(personaRecord)

    await personaDBWriteAccess((t) => deletePersonaDB(personaRecord.identifier, 'delete even with private', t))
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(null)
})

test('queryPersonaByProfileDB', async () => {
    const profileRecord = await createProfileRecord()
    const personaRecord = await createPersonaRecord()
    profileRecord.linkedPersona = personaRecord.identifier
    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecord, t)
        await createPersonaDB(personaRecord, t)
    })

    expect(await queryPersonaByProfileDB(profileRecord.identifier)).toEqual(personaRecord)
})

test('queryPersonasWithPrivateKey', async () => {
    const personaRecordA = await createPersonaRecord()
    const personaRecordB = await createPersonaRecord()
    await personaDBWriteAccess(async (t) => {
        await createPersonaDB(personaRecordA, t)
        await createPersonaDB(personaRecordB, t)
    })
    const names = (await queryPersonasWithPrivateKey()).map((p) => p.nickname)

    expect(names.includes(personaRecordA.nickname)).toBe(true)
    expect(names.includes(personaRecordB.nickname)).toBe(true)
})

test('createOrUpdatePersonaDB', async () => {
    const personaRecord = await createPersonaRecord()
    const personaRecordNew = await createPersonaRecord()
    const howToMerge = {
        linkedProfiles: 'replace',
        explicitUndefinedField: 'ignore',
    } as Parameters<typeof updatePersonaDB>[1]
    personaRecordNew.identifier = personaRecord.identifier

    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(null)

    await personaDBWriteAccess((t) => createOrUpdatePersonaDB(personaRecord, howToMerge, t))
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(personaRecord)

    await personaDBWriteAccess((t) => createOrUpdatePersonaDB(personaRecordNew, howToMerge, t))
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(personaRecordNew)
})

test('safeDeletePersonaDB', async () => {
    const personaRecord = await createPersonaRecord()
    const howToMerge = {
        linkedProfiles: 'replace',
        explicitUndefinedField: 'delete field',
    } as Parameters<typeof updatePersonaDB>[1]

    await personaDBWriteAccess((t) => createPersonaDB(personaRecord, t))
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(personaRecord)

    personaRecord.linkedProfiles.clear()
    await personaDBWriteAccess(async (t) => {
        await updatePersonaDB(personaRecord, howToMerge, t)
        await safeDeletePersonaDB(personaRecord.identifier, t)
    })
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(personaRecord)

    personaRecord.privateKey = undefined
    await personaDBWriteAccess(async (t) => {
        await updatePersonaDB(personaRecord, howToMerge, t)
        await safeDeletePersonaDB(personaRecord.identifier, t)
    })
    expect(await queryPersonaDB(personaRecord.identifier)).toEqual(null)
})

test('createProfileDB && queryProfileDB', async () => {
    const profileRecord = await createProfileRecord()
    await personaDBWriteAccess((t) => createProfileDB(profileRecord, t))
    expect(await queryProfileDB(profileRecord.identifier)).toEqual(profileRecord)
})

test('queryProfilesDB', async () => {
    const profileRecordA = await createProfileRecord()
    const profileRecordB = await createProfileRecord()
    const nicknames = [profileRecordA.nickname, profileRecordB.nickname]
    const networkIds = [profileRecordA.identifier.network, profileRecordB.identifier.network]
    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecordA, t)
        await createProfileDB(profileRecordB, t)
    })

    const profileRecords = await queryProfilesDB((p) => networkIds.includes(p.identifier.network))
    expect(profileRecords.length).toBe(2)
    expect(profileRecords.every((r) => nicknames.includes(r.nickname ?? ''))).toBeTruthy()
})

test('updateProfileDB', async () => {
    const profileRecord = await createProfileRecord()
    const profileRecordNew = await createProfileRecord()
    profileRecordNew.identifier = profileRecord.identifier

    await personaDBWriteAccess(async (t) => {
        await createProfileDB(profileRecord, t)
        await updateProfileDB(profileRecordNew, t)
    })

    expect(await queryProfileDB(profileRecord.identifier)).toEqual(profileRecordNew)
})

test('createOrUpdateProfileDB', async () => {
    const profileRecord = await createProfileRecord()
    const profileRecordNew = await createProfileRecord()
    profileRecordNew.identifier = profileRecord.identifier

    expect(await queryProfileDB(profileRecord.identifier)).toEqual(null)

    await personaDBWriteAccess((t) => createOrUpdateProfileDB(profileRecord, t))
    expect(await queryProfileDB(profileRecord.identifier)).toEqual(profileRecord)

    await personaDBWriteAccess((t) => createOrUpdateProfileDB(profileRecordNew, t))
    expect(await queryProfileDB(profileRecord.identifier)).toEqual(profileRecordNew)
})

test('attachProfileDB && detachProfileDB', async () => {
    const profileRecord = await createProfileRecord()
    const personaRecord = await createPersonaRecord()

    await personaDBWriteAccess(async (t) => {
        await createPersonaDB(personaRecord, t)
        await attachProfileDB(
            profileRecord.identifier,
            personaRecord.identifier,
            {
                connectionConfirmState: 'confirmed',
            },
            t,
        )
    })
    expect((await queryProfileDB(profileRecord.identifier))?.linkedPersona).toEqual(personaRecord.identifier)
})

test('deleteProfileDB', async () => {
    const profileRecord = await createProfileRecord()

    await personaDBWriteAccess((t) => createProfileDB(profileRecord, t))
    expect(await queryProfileDB(profileRecord.identifier)).toEqual(profileRecord)

    await personaDBWriteAccess((t) => deleteProfileDB(profileRecord.identifier, t))
    expect(await queryProfileDB(profileRecord.identifier)).toEqual(null)
})
