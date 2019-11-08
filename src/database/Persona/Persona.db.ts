/// <reference path="../global.d.ts" />

import { OnlyRunInContext } from '@holoflows/kit/es'
import { ProfileIdentifier, PersonaIdentifier, Identifier, ECKeyIdentifier } from '../type'
import { DBSchema, openDB, IDBPDatabase, IDBPTransaction } from 'idb/with-async-ittr'
/**
 * Database structure:
 *
 * # ObjectStore `persona`:
 * @description Store Personas.
 * @type {PersonaRecordDb}
 * @keys inline, {@link PersonaRecordDb.identifier}
 *
 * # ObjectStore `profiles`:
 * @description Store profiles.
 * @type {ProfileRecord}
 * A persona links to 0 or more profiles.
 * Each profile links to 0 or 1 persona.
 * @keys inline, {@link ProfileRecord.identifier}
 */

OnlyRunInContext('background', 'Persona db')

const db = (function() {
    let db: IDBPDatabase<PersonaDB> = undefined as any
    return async () => {
        if (typeof db === 'undefined')
            return openDB<PersonaDB>('maskbook-persona', 1, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    function v0_v1() {
                        db.createObjectStore('personas', { keyPath: 'identifier' })
                        db.createObjectStore('profiles', { keyPath: 'identifier' })
                        transaction.objectStore('profiles').createIndex('network', 'network', { unique: false })
                        transaction
                            .objectStore('personas')
                            .createIndex('hasPrivateKey', 'hasPrivateKey', { unique: false })
                    }
                    if (oldVersion < 1) v0_v1()
                },
            }).then(x => (db = x))
        else return db
    }
})()

//#region Plain methods
/**
 * Create a new Persona.
 * If the record contains `privateKey`, it will be stored in the `self` store.
 * Otherwise, it will be stored in the `others` store.
 */
async function createPersonaDB(record: PersonaRecord, t?: IDBPTransaction<PersonaDB, ['personas']>): Promise<void> {
    t = t || (await db()).transaction('personas', 'readwrite')
    t.objectStore('personas').add(personaRecordToDB(record))
}

/**
 * Query a Persona.
 */
async function queryPersonaDB(
    query: PersonaIdentifier,
    t?: IDBPTransaction<PersonaDB, ['personas']>,
): Promise<PersonaRecord | null> {
    t = t || (await db()).transaction('personas')
    const x = await t.objectStore('personas').get(query.toText())
    if (x) return personaRecordOutDb(x)
    return null
}

/**
 * Query many Personas.
 */
async function queryPersonasDB(
    query: (record: PersonaRecord) => boolean,
    t?: IDBPTransaction<PersonaDB, ['personas']>,
): Promise<PersonaRecord[]> {
    t = t || (await db()).transaction('personas')
    const records: PersonaRecord[] = []
    for await (const each of t.objectStore('personas').iterate()) {
        const out = personaRecordOutDb(each.value)
        if (query(out)) records.push(out)
    }
    return records
}

/**
 * Update an existing Persona record.
 * @param record The partial record to be merged
 */
async function updatePersonaDB(
    record: Partial<PersonaRecord> & Pick<PersonaRecord, 'identifier'>,
    t?: IDBPTransaction<PersonaDB, ['personas']>,
): Promise<void> {
    t = t || (await db()).transaction('personas', 'readwrite')
    const old = await t.objectStore('personas').get(record.identifier.toText())
    if (!old) throw new TypeError('Update an non-exist data')

    /**
     * If the linkedProfiles is changed, throw.
     */
    if (record.linkedProfiles) {
        const msg = `Can not use "updatePersonaDB" to update linkedProfiles. Use "updatePersonaLinkedProfilesDB" instead`
        if (record.linkedProfiles.size !== old.linkedProfiles.size) throw new Error(msg)
        for (const each of record.linkedProfiles) Object.setPrototypeOf(each, ProfileIdentifier.prototype)
        for (const each of old.linkedProfiles) Object.setPrototypeOf(each, ProfileIdentifier.prototype)
        if (
            Array.from(record.linkedProfiles)
                .map(x => x.toText())
                .join('\n') !==
            Array.from(old.linkedProfiles)
                .map(x => x.toText())
                .join('\n')
        )
            throw new Error(msg)
    }
    const next: PersonaRecordDb = personaRecordToDB({
        ...old,
        ...record,
    })
    await t.objectStore('personas').put(next)
}

/**
 * Delete a Persona
 * Don't implement this kind of function.
 */
function deletePersonaDB(id: never, t?: IDBPTransaction<PersonaDB, ['personas']>): never {
    throw new Error(
        `If you want to remove a persona, you should also detach all of the profiles connected to it. That function will remove the persona if there is 0 profiles connecting.`,
    )
}

/**
 * Create a new profile.
 */
async function createProfileDB(
    record: ProfileRecord,
    t?: IDBPTransaction<PersonaDB, ['profiles', 'personas']>,
): Promise<void> {
    t = t || (await db()).transaction(['profiles', 'personas'], 'readwrite')
    if (record.linkedPersona) {
        const persona = await t.objectStore('personas').get(record.linkedPersona.toText())
        if (!persona) {
            // TODO: should we throw or create a profile for them?
            throw new Error('Creating a new profile that connected to a not recorded persona')
        }
        persona.linkedProfiles.add(record.identifier)
        await t.objectStore('personas').put(persona)
    }
    await t.objectStore('profiles').add(profileToDB(record))
}

/**
 * Query a profile.
 */
async function queryProfileDB(
    id: ProfileIdentifier,
    t?: IDBPTransaction<PersonaDB, ['profiles']>,
): Promise<ProfileRecord | null> {
    t = t || (await db()).transaction('profiles')
    const result = await t.objectStore('profiles').get(id.toText())
    if (result) return profileOutDB(result)
    return null
}

/**
 * Query many profiles.
 */
async function queryProfilesDB(
    network: string | ((record: ProfileRecord) => boolean),
    t?: IDBPTransaction<PersonaDB, ['profiles']>,
): Promise<ProfileRecord[]> {
    t = t || (await db()).transaction('profiles')
    const result: ProfileRecord[] = []
    if (typeof network === 'string') {
        result.push(
            ...(await t
                .objectStore('profiles')
                .index('network')
                .getAll(IDBKeyRange.only(network))).map(profileOutDB),
        )
    } else {
        for await (const each of t.objectStore('profiles').iterate()) {
            const out = profileOutDB(each.value)
            if (network(out)) result.push(out)
        }
    }
    return result
}

/**
 * Update a profile.
 */
async function updateProfileDB(
    updating: Partial<ProfileRecord> & Pick<ProfileRecord, 'identifier'>,
    t?: IDBPTransaction<PersonaDB, ('profiles' | 'personas')[]>,
): Promise<void> {
    t = t || (await db()).transaction(['profiles', 'personas'], 'readwrite')
    const old = await t.objectStore('profiles').get(updating.identifier.toText())
    if (!old) throw new Error('Updating a non exists record')
    let linkedPersona: PersonaRecordDb | undefined = undefined
    if (updating.linkedPersona) {
        linkedPersona = await t.objectStore('personas').get(updating.linkedPersona.toText())
        if (linkedPersona === undefined) {
            // TODO: what to do?
        } else {
            // TODO: what to do?
        }
    }
    const nextRecord: ProfileRecordDB = profileToDB({
        ...profileOutDB(old),
        ...updating,
    })
    await t.objectStore('profiles').put(nextRecord)
}

/**
 * Delete a profile
 */
async function deleteProfileDB(
    id: ProfileIdentifier,
    t?: IDBPTransaction<PersonaDB, ('profiles' | 'personas')[]>,
): Promise<void> {
    t = t || (await db()).transaction(['profiles', 'personas'], 'readwrite')
    const rec = await t.objectStore('profiles').get(id.toText())
    if (!rec) return
    if (rec.linkedPersona) {
        // TODO: Sync the persona
    }
    await t.objectStore('profiles').delete(id.toText())
}

//#endregion

//#region Type
interface ProfileRecord {
    identifier: ProfileIdentifier
    nickname?: string
    localKey?: CryptoKey
    linkedPersona?: PersonaIdentifier
    createdAt: Date
    updatedAt: Date
}

interface PersonaRecord {
    identifier: PersonaIdentifier
    publicKey: CryptoKey
    privateKey?: CryptoKey
    /**
     * This field is used as index of the db.
     */
    hasPrivateKey: 'no' | 'yes'
    localKey?: CryptoKey
    nickname: string
    linkedProfiles: Set<ProfileIdentifier>
    createdAt: Date
    updatedAt: Date
}
type ProfileRecordDB = Omit<ProfileRecord, 'identifier' | 'hasPrivateKey'> & { identifier: string }
type PersonaRecordDb = Omit<PersonaRecord, 'identifier'> & { identifier: string }

interface PersonaDB extends DBSchema {
    /** Use inline keys */
    personas: {
        value: PersonaRecordDb
        key: string
        indexes: {
            hasPrivateKey: string
        }
    }
    /** Use inline keys */
    profiles: {
        value: ProfileRecordDB
        key: string
        indexes: {
            // Use `network` field as index
            network: string
        }
    }
}
//#endregion

//#region out db & to db
function profileToDB(x: ProfileRecord): ProfileRecordDB {
    return {
        ...x,
        identifier: x.identifier.toText(),
    }
}
function profileOutDB(x: ProfileRecordDB): ProfileRecord {
    if (x.linkedPersona) {
        if (x.linkedPersona.type === 'ec_key') Object.setPrototypeOf(x.linkedPersona, ECKeyIdentifier.prototype)
        else throw new Error('Unknown type of linkedPersona')
    }
    return { ...x, identifier: Identifier.fromString(x.identifier) as ProfileIdentifier }
}
function personaRecordToDB(x: PersonaRecord): PersonaRecordDb {
    return {
        ...x,
        identifier: x.identifier.toText(),
        hasPrivateKey: x.privateKey ? 'yes' : 'no',
    }
}
function personaRecordOutDb(x: PersonaRecordDb): PersonaRecord {
    for (const each of x.linkedProfiles) {
        Object.setPrototypeOf(each, ProfileIdentifier.prototype)
    }
    const obj = { ...x, identifier: Identifier.fromString(x.identifier) as PersonaIdentifier }
    delete obj.hasPrivateKey
    return obj
}
//#endregion
