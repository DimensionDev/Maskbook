/// <reference path="../global.d.ts" />

import { OnlyRunInContext } from '@holoflows/kit/es'
import { ProfileIdentifier, PersonaIdentifier, Identifier, ECKeyIdentifier } from '../type'
import { DBSchema, openDB, IDBPDatabase, IDBPTransaction } from 'idb/with-async-ittr'
import { IdentifierMap } from '../IdentifierMap'
import { PrototypeLess, restorePrototype } from '../../utils/type'
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

const db = (function() {
    let db: IDBPDatabase<PersonaDB> = undefined as any
    return async () => {
        OnlyRunInContext('background', 'Persona db')
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

export const PersonaDBAccess = db

//#region Plain methods
/**
 * Create a new Persona.
 * If the record contains `privateKey`, it will be stored in the `self` store.
 * Otherwise, it will be stored in the `others` store.
 */
export async function createPersonaDB(
    record: PersonaRecord,
    t?: IDBPTransaction<PersonaDB, ['personas']>,
): Promise<void> {
    t = t || (await db()).transaction('personas', 'readwrite')
    t.objectStore('personas').add(personaRecordToDB(record))
}

export async function queryPersonaByProfileDB(
    query: ProfileIdentifier,
    t?: IDBPTransaction<PersonaDB, ['profiles', 'personas']>,
): Promise<PersonaRecord | null> {
    t = t || (await db()).transaction(['profiles', 'personas'])
    const x = await t.objectStore('profiles').get(query.toText())
    if (!x?.linkedPersona) return null
    return queryPersonaDB(x.linkedPersona, t as any)
}

/**
 * Query a Persona.
 */
export async function queryPersonaDB(
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
export async function queryPersonasDB(
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

export type PersonaRecordWithPrivateKey = PersonaRecord & Required<Pick<PersonaRecord, 'privateKey'>>
/**
 * Query many Personas.
 */
export async function queryPersonasWithPrivateKey(
    t?: IDBPTransaction<PersonaDB, ['personas']>,
): Promise<PersonaRecordWithPrivateKey[]> {
    t = t || (await db()).transaction('personas')
    const records: PersonaRecord[] = []
    records.push(
        ...(
            await t
                .objectStore('personas')
                .index('hasPrivateKey')
                .getAll(IDBKeyRange.only('yes'))
        ).map(personaRecordOutDb),
    )
    return records as PersonaRecordWithPrivateKey[]
}

/**
 * Update an existing Persona record.
 * @param record The partial record to be merged
 */
export async function updatePersonaDB(
    record: Partial<PersonaRecord> & Pick<PersonaRecord, 'identifier'>,
    t?: IDBPTransaction<PersonaDB, ['personas']>,
): Promise<void> {
    t = t || (await db()).transaction('personas', 'readwrite')
    const _old = await t.objectStore('personas').get(record.identifier.toText())
    if (!_old) throw new TypeError('Update an non-exist data')
    const old = personaRecordOutDb(_old)

    if ('linkedProfiles' in record) {
        throw new Error(`Can not use "updatePersonaDB" to update linkedProfiles.`)
    }
    const next: PersonaRecordDb = personaRecordToDB({
        ...old,
        ...record,
    })
    await t.objectStore('personas').put(next)
}

/**
 * Delete a Persona
 */
export async function deletePersonaDB(
    id: PersonaIdentifier,
    confirm?: 'delete even with private' | "don't delete if have private key",
    t?: IDBPTransaction<PersonaDB, ['personas']>,
): Promise<void> {
    t = t || (await db()).transaction('personas', 'readwrite')
    const r = await t.objectStore('personas').get(id.toText())
    if (!r) return
    if (r.linkedProfiles.size !== 0)
        throw new Error(`If you want to remove a persona, you should also detach all of the profiles connected to it.`)
    if (confirm !== 'delete even with private' && r.privateKey)
        throw new TypeError('Cannot delete a persona with a private key')
    await t.objectStore('personas').delete(id.toText())
}
/**
 * Delete a Persona
 * @returns a boolean. true: the record no longer exists; false: the record is kept.
 */
export async function safeDeletePersonaDB(
    id: PersonaIdentifier,
    t?: IDBPTransaction<PersonaDB, ['personas']>,
): Promise<boolean> {
    t = t || (await db()).transaction('personas', 'readwrite')
    const r = await t.objectStore('personas').get(id.toText())
    if (!r) return true
    if (r.linkedProfiles.size !== 0) return false
    if (r.privateKey) return false
    await t.objectStore('personas').delete(id.toText())
    return true
}

/**
 * Create a new profile.
 */
export async function createProfileDB(
    record: ProfileRecord,
    t?: IDBPTransaction<PersonaDB, ['profiles']>,
): Promise<void> {
    t = t || (await db()).transaction(['profiles'], 'readwrite')
    if (record.linkedPersona) {
        throw new TypeError('Please call attachProfileDB')
    }
    await t.objectStore('profiles').add(profileToDB(record))
}

/**
 * Query a profile.
 */
export async function queryProfileDB(
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
export async function queryProfilesDB(
    network: string | ((record: ProfileRecord) => boolean),
    t?: IDBPTransaction<PersonaDB, ['profiles']>,
): Promise<ProfileRecord[]> {
    t = t || (await db()).transaction('profiles')
    const result: ProfileRecord[] = []
    if (typeof network === 'string') {
        result.push(
            ...(
                await t
                    .objectStore('profiles')
                    .index('network')
                    .getAll(IDBKeyRange.only(network))
            ).map(profileOutDB),
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
export async function updateProfileDB(
    updating: Partial<ProfileRecord> & Pick<ProfileRecord, 'identifier'>,
    t?: IDBPTransaction<PersonaDB, ['profiles']>,
): Promise<void> {
    t = t || (await db()).transaction('profiles', 'readwrite')
    const old = await t.objectStore('profiles').get(updating.identifier.toText())
    if (!old) throw new Error('Updating a non exists record')

    const oldLinkedPersona = restorePrototype(old.linkedPersona, ECKeyIdentifier.prototype)

    if (updating.linkedPersona && (!oldLinkedPersona || updating.linkedPersona.equals(oldLinkedPersona))) {
        throw new TypeError('Use attachProfileDB or deattachProfileDB to update the linkedPersona')
    }
    const nextRecord: ProfileRecordDB = profileToDB({
        ...profileOutDB(old),
        ...updating,
    })
    await t.objectStore('profiles').put(nextRecord)
}

/**
 * detach a profile.
 */
export async function detachProfileDB(
    identifier: ProfileIdentifier,
    t?: IDBPTransaction<PersonaDB, ('profiles' | 'personas')[]>,
): Promise<void> {
    t = t || (await db()).transaction(['profiles', 'personas'], 'readwrite')
    const profile = await t.objectStore('profiles').get(identifier.toText())
    if (!profile?.linkedPersona) return

    const linkedPersona = restorePrototype(profile.linkedPersona, ECKeyIdentifier.prototype)
    const ec_id = linkedPersona.toText()
    const persona = await t.objectStore('personas').get(ec_id)
    persona?.linkedProfiles.delete(ec_id)

    if (persona) {
        if (await safeDeletePersonaDB(linkedPersona, t as any)) {
            // persona deleted
        } else {
            // update persona
            await t.objectStore('personas').put(persona)
        }
    }

    // update profile
    delete profile.linkedPersona
    await t.objectStore('profiles').put(profile)
}

/**
 * attach a profile.
 */
export async function attachProfileDB(
    identifier: ProfileIdentifier,
    attachTo: PersonaIdentifier,
    data: LinkedProfileDetails,
    t?: IDBPTransaction<PersonaDB, ('profiles' | 'personas')[]>,
): Promise<void> {
    t = t || (await db()).transaction(['profiles', 'personas'], 'readwrite')
    const profile = await queryProfileDB(identifier, t as any)
    const persona = await queryPersonaDB(attachTo, t as any)
    if (!profile || !persona) return

    if (profile.linkedPersona !== undefined && profile.linkedPersona.equals(attachTo)) {
        await detachProfileDB(identifier, t)
    }

    profile.linkedPersona = attachTo
    persona.linkedProfiles.set(identifier, data)

    await t.objectStore('profiles').put(profileToDB(profile))
    await t.objectStore('personas').put(personaRecordToDB(persona))
}

/**
 * Delete a profile
 */
export async function deleteProfileDB(
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
export interface ProfileRecord {
    identifier: ProfileIdentifier
    nickname?: string
    localKey?: CryptoKey
    linkedPersona?: PersonaIdentifier
    createdAt: Date
    updatedAt: Date
}

export interface LinkedProfileDetails {
    connectionConfirmState: 'confirmed' | 'pending' | 'denied'
}

export interface PersonaRecord {
    identifier: PersonaIdentifier
    publicKey: JsonWebKey
    privateKey?: JsonWebKey
    localKey?: CryptoKey
    nickname?: string
    linkedProfiles: IdentifierMap<ProfileIdentifier, LinkedProfileDetails>
    createdAt: Date
    updatedAt: Date
}
type ProfileRecordDB = Omit<ProfileRecord, 'identifier' | 'hasPrivateKey' | 'linkedPersona'> & {
    identifier: string
    network: string
    linkedPersona?: PrototypeLess<PersonaIdentifier>
}
type PersonaRecordDb = Omit<PersonaRecord, 'identifier' | 'linkedProfiles'> & {
    identifier: string
    linkedProfiles: Map<string, LinkedProfileDetails>
    /**
     * This field is used as index of the db.
     */
    hasPrivateKey: 'no' | 'yes'
}

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
        network: x.identifier.network,
    }
}
function profileOutDB({ network, ...x }: ProfileRecordDB): ProfileRecord {
    if (x.linkedPersona) {
        if (x.linkedPersona.type !== 'ec_key') throw new Error('Unknown type of linkedPersona')
    }
    return {
        ...x,
        identifier: Identifier.fromString(x.identifier) as ProfileIdentifier,
        linkedPersona: restorePrototype(x.linkedPersona, ECKeyIdentifier.prototype),
    }
}
function personaRecordToDB(x: PersonaRecord): PersonaRecordDb {
    return {
        ...x,
        identifier: x.identifier.toText(),
        hasPrivateKey: x.privateKey ? 'yes' : 'no',
        linkedProfiles: x.linkedProfiles.__raw_map__,
    }
}
function personaRecordOutDb(x: PersonaRecordDb): PersonaRecord {
    delete x.hasPrivateKey
    const obj: PersonaRecord = {
        ...x,
        identifier: Identifier.fromString(x.identifier) as PersonaIdentifier,
        linkedProfiles: new IdentifierMap(x.linkedProfiles),
    }
    return obj
}
//#endregion
