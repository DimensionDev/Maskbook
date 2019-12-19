/// <reference path="../global.d.ts" />

import { OnlyRunInContext } from '@holoflows/kit/es'
import { ProfileIdentifier, PersonaIdentifier, Identifier, ECKeyIdentifier } from '../type'
import { DBSchema, openDB, IDBPTransaction } from 'idb/with-async-ittr'
import { IdentifierMap } from '../IdentifierMap'
import { PrototypeLess, restorePrototype } from '../../utils/type'
import { MessageCenter } from '../../utils/messages'
import { createDBAccess } from '../helpers/openDB'
import { queryProfile } from './helpers'
import { assertPersonaDBConsistency } from './consistency'
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

const db = createDBAccess(() => {
    OnlyRunInContext('background', 'Persona db')
    return openDB<PersonaDB>('maskbook-persona', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            function v0_v1() {
                db.createObjectStore('personas', { keyPath: 'identifier' })
                db.createObjectStore('profiles', { keyPath: 'identifier' })
                transaction.objectStore('profiles').createIndex('network', 'network', { unique: false })
                transaction.objectStore('personas').createIndex('hasPrivateKey', 'hasPrivateKey', { unique: false })
            }
            if (oldVersion < 1) v0_v1()
        },
    })
})

type FullTransaction = IDBPTransaction<PersonaDB, ('personas' | 'profiles')[]>
type ProfileTransaction = IDBPTransaction<PersonaDB, ['profiles']>
type PersonaTransaction = IDBPTransaction<PersonaDB, ['personas']>
export async function consistentPersonaDBWriteAccess(
    action: (t: FullTransaction) => Promise<void>,
    tryToAutoFix = true,
) {
    // TODO: collect all changes on this transaction then only perform consistency check on those records.
    const t = (await db()).transaction(['personas', 'profiles'], 'readwrite')
    await action(t)
    await assertPersonaDBConsistency(tryToAutoFix ? 'fix' : 'throw', 'full check', t)
}

//#region Plain methods
/**
 * Create a new Persona.
 * If the record contains `privateKey`, it will be stored in the `self` store.
 * Otherwise, it will be stored in the `others` store.
 */
export async function createPersonaDB(record: PersonaRecord, t: PersonaTransaction): Promise<void> {
    await t.objectStore('personas').add(personaRecordToDB(record))
    MessageCenter.emit('personaCreated', undefined)
    MessageCenter.emit('personaUpdated', undefined)
}

export async function queryPersonaByProfileDB(
    query: ProfileIdentifier,
    t?: FullTransaction,
): Promise<PersonaRecord | null> {
    t = t || (await db()).transaction(['profiles', 'personas'])
    const x = await t.objectStore('profiles').get(query.toText())
    if (!x?.linkedPersona) return null
    return queryPersonaDB(restorePrototype(x.linkedPersona, ECKeyIdentifier.prototype), t as any)
}

/**
 * Query a Persona.
 */
export async function queryPersonaDB(query: PersonaIdentifier, t?: PersonaTransaction): Promise<PersonaRecord | null> {
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
    t?: PersonaTransaction,
): Promise<PersonaRecord[]> {
    t = t || (await db()).transaction('personas')
    const records: PersonaRecord[] = []
    for await (const each of t.objectStore('personas')) {
        const out = personaRecordOutDb(each.value)
        if (query(out)) records.push(out)
    }
    return records
}

export type PersonaRecordWithPrivateKey = PersonaRecord & Required<Pick<PersonaRecord, 'privateKey'>>
/**
 * Query many Personas.
 */
export async function queryPersonasWithPrivateKey(t?: PersonaTransaction): Promise<PersonaRecordWithPrivateKey[]> {
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
    linkedProfilesMerge: 'replace' | 'merge',
    t: PersonaTransaction,
): Promise<void> {
    const _old = await t.objectStore('personas').get(record.identifier.toText())
    if (!_old) throw new TypeError('Update an non-exist data')
    const old = personaRecordOutDb(_old)
    let nextLinkedProfiles = old.linkedProfiles
    if (record.linkedProfiles) {
        if (linkedProfilesMerge === 'merge')
            new IdentifierMap(new Map([...nextLinkedProfiles.__raw_map__, ...record.linkedProfiles.__raw_map__]))
        else nextLinkedProfiles = record.linkedProfiles
    }
    const next: PersonaRecordDb = personaRecordToDB({
        ...old,
        ...record,
        linkedProfiles: nextLinkedProfiles,
    })
    await t.objectStore('personas').put(next)
    MessageCenter.emit('personaUpdated', undefined)
}

export async function createOrUpdatePersonaDB(record: PersonaRecord, t: PersonaTransaction) {
    if (await t.objectStore('personas').get(record.identifier.toText())) return updatePersonaDB(record, 'merge', t)
    else return createPersonaDB(record, t)
}

/**
 * Delete a Persona
 */
export async function deletePersonaDB(
    id: PersonaIdentifier,
    confirm: 'delete even with private' | "don't delete if have private key",
    t: PersonaTransaction,
): Promise<void> {
    const r = await t.objectStore('personas').get(id.toText())
    if (!r) return
    if (confirm !== 'delete even with private' && r.privateKey)
        throw new TypeError('Cannot delete a persona with a private key')
    await t.objectStore('personas').delete(id.toText())
    MessageCenter.emit('personaUpdated', undefined)
}
/**
 * Delete a Persona
 * @returns a boolean. true: the record no longer exists; false: the record is kept.
 */
export async function safeDeletePersonaDB(id: PersonaIdentifier, t?: PersonaTransaction): Promise<boolean> {
    t = t || (await db()).transaction('personas', 'readwrite')
    const r = await queryPersonaDB(id, t)
    if (!r) return true
    if (r.linkedProfiles.size !== 0) return false
    if (r.privateKey) return false
    await deletePersonaDB(id, "don't delete if have private key", t)
    MessageCenter.emit('personaUpdated', undefined)
    return true
}

/**
 * Create a new profile.
 */
export async function createProfileDB(record: ProfileRecord, t: ProfileTransaction): Promise<void> {
    await t.objectStore('profiles').add(profileToDB(record))
    setTimeout(async () => {
        MessageCenter.emit('profilesChanged', [{ reason: 'new', of: await queryProfile(record.identifier) }])
    }, 0)
}

/**
 * Query a profile.
 */
export async function queryProfileDB(id: ProfileIdentifier, t?: ProfileTransaction): Promise<ProfileRecord | null> {
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
    t?: ProfileTransaction,
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
    t: ProfileTransaction,
): Promise<void> {
    const old = await t.objectStore('profiles').get(updating.identifier.toText())
    if (!old) throw new Error('Updating a non exists record')

    const nextRecord: ProfileRecordDB = profileToDB({
        ...profileOutDB(old),
        ...updating,
    })
    await t.objectStore('profiles').put(nextRecord)
    setTimeout(
        async () =>
            MessageCenter.emit('profilesChanged', [
                { reason: 'update', of: await queryProfile(updating.identifier) } as const,
            ]),
        0,
    )
}
export async function createOrUpdateProfileDB(rec: ProfileRecord, t: ProfileTransaction) {
    if (await queryProfileDB(rec.identifier, t)) return updateProfileDB(rec, t)
    else return createProfileDB(rec, t)
}

/**
 * detach a profile.
 */
export async function detachProfileDB(identifier: ProfileIdentifier, t?: FullTransaction): Promise<void> {
    t = t || (await db()).transaction(['profiles', 'personas'], 'readwrite')
    const profile = await queryProfileDB(identifier, t as any)
    if (!profile?.linkedPersona) return

    const linkedPersona = profile.linkedPersona
    const persona = await queryPersonaDB(linkedPersona, t as any)
    persona?.linkedProfiles.delete(identifier)

    if (persona) {
        // if (await safeDeletePersonaDB(linkedPersona, t as any)) {
        // persona deleted
        // } else {
        // update persona
        await updatePersonaDB(persona, 'replace', t as any)
        // }
    }
    // update profile
    delete profile.linkedPersona
    await updateProfileDB(profile, t as any)
}

/**
 * attach a profile.
 */
export async function attachProfileDB(
    identifier: ProfileIdentifier,
    attachTo: PersonaIdentifier,
    data: LinkedProfileDetails,
    t?: FullTransaction,
): Promise<void> {
    t = t || (await db()).transaction(['profiles', 'personas'], 'readwrite')
    const profile =
        (await queryProfileDB(identifier, t as any)) ||
        (await createProfileDB({ identifier, createdAt: new Date(), updatedAt: new Date() }, t as any)) ||
        (await queryProfileDB(identifier, t as any))
    const persona = await queryPersonaDB(attachTo, t as any)
    if (!persona || !profile) return

    if (profile.linkedPersona !== undefined && !profile.linkedPersona.equals(attachTo)) {
        await detachProfileDB(identifier, t)
    }

    profile.linkedPersona = attachTo
    persona.linkedProfiles.set(identifier, data)

    await updatePersonaDB(persona, 'merge', t as any)
    await updateProfileDB(profile, t as any)
}

/**
 * Delete a profile
 */
export async function deleteProfileDB(id: ProfileIdentifier, t: FullTransaction): Promise<void> {
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
    /**
     * If this key is generated by the mnemonic word, this field should be set.
     */
    mnemonic?: {
        words: string
        parameter: { path: string; withPassword: boolean }
    }
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

export interface PersonaDB extends DBSchema {
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
        identifier: Identifier.fromString(x.identifier, ProfileIdentifier).unwrap(
            `Invalid identifier found, expected ProfileIdentifier, actual ${x.identifier}`,
        ),
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
        identifier: Identifier.fromString(x.identifier, ECKeyIdentifier).unwrap(
            `This record has an invalid identifier, wanted ECKeyIdentifier, ${x.identifier}`,
        ),
        linkedProfiles: new IdentifierMap(x.linkedProfiles, ProfileIdentifier),
    }
    return obj
}
//#endregion
