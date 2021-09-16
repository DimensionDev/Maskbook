/// <reference path="../global.d.ts" />
import Fuse from 'fuse.js'
import { ECKeyIdentifier, Identifier, PersonaIdentifier, ProfileIdentifier } from '../type'
import { DBSchema, openDB } from 'idb/with-async-ittr-cjs'
import { IdentifierMap } from '../IdentifierMap'
import { PrototypeLess, restorePrototype } from '../../utils/type'
import { MaskMessage } from '../../utils/messages'
import { createDBAccessWithAsyncUpgrade, createTransaction, IDBPSafeTransaction } from '../helpers/openDB'
import { assertPersonaDBConsistency } from './consistency'
import type {
    AESJsonWebKey,
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
} from '../../modules/CryptoAlgorithm/interfaces/utils'
import { CryptoKeyToJsonWebKey } from '../../utils/type-transform/CryptoKey-JsonWebKey'

/**
 * Database structure:
 *
 * # ObjectStore `persona`:
 * @description Store Personas.
 * @type {PersonaRecordDB}
 * @keys inline, {@link PersonaRecordDb.identifier}
 *
 * # ObjectStore `profiles`:
 * @description Store profiles.
 * @type {ProfileRecord}
 * A persona links to 0 or more profiles.
 * Each profile links to 0 or 1 persona.
 * @keys inline, {@link ProfileRecord.identifier}
 *
 * # ObjectStore `relations`:
 * @description Store relations.
 * @type {RelationRecord}
 * Save the relationship between persona and profile.
 * @keys inline {@link RelationRecord.linked  @link RelationRecord.profile}
 */

const db = createDBAccessWithAsyncUpgrade<PersonaDB, Knowledge>(
    1,
    3,
    (currentOpenVersion, knowledge) => {
        return openDB<PersonaDB>('maskbook-persona', currentOpenVersion, {
            upgrade(db, oldVersion, newVersion, transaction) {
                function v0_v1() {
                    db.createObjectStore('personas', { keyPath: 'identifier' })
                    db.createObjectStore('profiles', { keyPath: 'identifier' })
                    transaction.objectStore('profiles').createIndex('network', 'network', { unique: false })
                    transaction.objectStore('personas').createIndex('hasPrivateKey', 'hasPrivateKey', { unique: false })
                }
                async function v1_v2() {
                    const persona = transaction.objectStore('personas')
                    const profile = transaction.objectStore('profiles')
                    await update(persona)
                    await update(profile)
                    async function update(q: typeof persona | typeof profile) {
                        for await (const rec of persona) {
                            if (!rec.value.localKey) continue
                            const jwk = knowledge?.data.get(rec.value.identifier)
                            if (!jwk) {
                                // !!! This should not happen
                                // !!! Remove it will implicitly drop user's localKey
                                delete rec.value.localKey
                                // !!! Keep it will leave a bug, broken data in the DB
                                // continue
                                // !!! DON'T throw cause it will break the database upgrade
                            }
                            rec.value.localKey = jwk
                            await rec.update(rec.value)
                        }
                    }
                }
                async function v2_v3() {
                    db.createObjectStore('relations', { keyPath: ['linked', 'profile'] })
                    transaction
                        .objectStore('relations')
                        .createIndex('linked, profile, favor', ['linked', 'profile', 'favor'], { unique: true })
                }
                if (oldVersion < 1) return v0_v1()
                if (oldVersion < 2) v1_v2()
                if (oldVersion < 3) v2_v3()
            },
        })
    },
    async (db) => {
        if (db.version === 1) {
            const map: V1To2 = { version: 2, data: new Map() }
            const t = createTransaction(db, 'readonly')('personas', 'profiles')
            const a = await t.objectStore('personas').getAll()
            const b = await t.objectStore('profiles').getAll()
            for (const rec of [...a, ...b]) {
                if (!rec.localKey) continue
                map.data.set(rec.identifier, await CryptoKeyToJsonWebKey(rec.localKey as any))
            }
            return map
        }
        return undefined
    },
)
type V1To2 = { version: 2; data: Map<string, AESJsonWebKey> }
type Knowledge = V1To2
export const createPersonaDBAccess = db
export type FullPersonaDBTransaction<Mode extends 'readonly' | 'readwrite'> = IDBPSafeTransaction<
    PersonaDB,
    ['personas', 'profiles', 'relations'],
    Mode
>
export type ProfileTransaction<Mode extends 'readonly' | 'readwrite'> = IDBPSafeTransaction<
    PersonaDB,
    ['profiles'],
    Mode
>
export type PersonasTransaction<Mode extends 'readonly' | 'readwrite'> = IDBPSafeTransaction<
    PersonaDB,
    ['personas'],
    Mode
>

export type RelationTransaction<Mode extends 'readonly' | 'readwrite'> = IDBPSafeTransaction<
    PersonaDB,
    ['relations'],
    Mode
>

export async function consistentPersonaDBWriteAccess(
    action: (t: FullPersonaDBTransaction<'readwrite'>) => Promise<void>,
    tryToAutoFix = true,
) {
    // TODO: collect all changes on this transaction then only perform consistency check on those records.
    const database = await db()
    let t = createTransaction(database, 'readwrite')('profiles', 'personas', 'relations')
    let finished = false
    const finish = () => (finished = true)
    t.addEventListener('abort', finish)
    t.addEventListener('complete', finish)
    t.addEventListener('error', finish)

    // Pause those events when patching write access
    const resumeProfile = MaskMessage.events.profilesChanged.pause()
    const resumePersona = MaskMessage.events.ownPersonaChanged.pause()
    const resumeRelation = MaskMessage.events.relationsChanged.pause()
    try {
        await action(t)
    } finally {
        if (finished) {
            console.warn('The transaction ends too early! There MUST be a bug in the program!')
            console.trace()
            // start a new transaction to check consistency
            t = createTransaction(database, 'readwrite')('profiles', 'personas', 'relations')
        }
        try {
            await assertPersonaDBConsistency(tryToAutoFix ? 'fix' : 'throw', 'full check', t)
            resumeProfile((data) => [data.flat()])
            resumePersona((data) => (data.length ? [undefined] : []))
            resumeRelation((data) => [data.flat()])
        } finally {
            // If the consistency check throws, we drop all pending events
            resumeProfile(() => [])
            resumePersona(() => [])
            resumePersona(() => [])
        }
    }
}

//#region Plain methods
/** Create a new Persona. */
export async function createPersonaDB(record: PersonaRecord, t: PersonasTransaction<'readwrite'>): Promise<void> {
    await t.objectStore('personas').add(personaRecordToDB(record))
    record.privateKey && MaskMessage.events.ownPersonaChanged.sendToAll(undefined)
}

export async function queryPersonaByProfileDB(
    query: ProfileIdentifier,
    t?: FullPersonaDBTransaction<'readonly'>,
): Promise<PersonaRecord | null> {
    t = t || createTransaction(await db(), 'readonly')('personas', 'profiles', 'relations')
    const x = await t.objectStore('profiles').get(query.toText())
    if (!x?.linkedPersona) return null
    return queryPersonaDB(restorePrototype(x.linkedPersona, ECKeyIdentifier.prototype), t)
}

/**
 * Query a Persona.
 */
export async function queryPersonaDB(
    query: PersonaIdentifier,
    t?: PersonasTransaction<'readonly'>,
    isIncludeLogout?: boolean,
): Promise<PersonaRecord | null> {
    t = t || createTransaction(await db(), 'readonly')('personas')
    const x = await t.objectStore('personas').get(query.toText())
    if (x && (isIncludeLogout || !x.hasLogout)) return personaRecordOutDB(x)
    return null
}

/**
 * Query many Personas.
 */
export async function queryPersonasDB(
    query: (record: PersonaRecord) => boolean,
    t?: PersonasTransaction<'readonly'>,
    isIncludeLogout?: boolean,
): Promise<PersonaRecord[]> {
    t = t || createTransaction(await db(), 'readonly')('personas')
    const records: PersonaRecord[] = []
    for await (const each of t.objectStore('personas')) {
        const out = personaRecordOutDB(each.value)
        if (query(out) && (isIncludeLogout || !out.hasLogout)) records.push(out)
    }
    return records
}

export type PersonaRecordWithPrivateKey = PersonaRecord & Required<Pick<PersonaRecord, 'privateKey'>>
/**
 * Query many Personas.
 */
export async function queryPersonasWithPrivateKey(
    t?: FullPersonaDBTransaction<'readonly'>,
): Promise<PersonaRecordWithPrivateKey[]> {
    t = t || createTransaction(await db(), 'readonly')('personas', 'profiles', 'relations')
    const records: PersonaRecord[] = []
    records.push(
        ...(await t.objectStore('personas').index('hasPrivateKey').getAll(IDBKeyRange.only('yes'))).map(
            personaRecordOutDB,
        ),
    )
    return records as PersonaRecordWithPrivateKey[]
}

/**
 * Update an existing Persona record.
 * @param nextRecord The partial record to be merged
 * @param howToMerge How to merge linkedProfiles and `field: undefined`
 * @param t transaction
 */
export async function updatePersonaDB(
    // Do a copy here. We need to delete keys from it.
    { ...nextRecord }: Readonly<Partial<PersonaRecord> & Pick<PersonaRecord, 'identifier'>>,
    howToMerge: {
        linkedProfiles: 'replace' | 'merge'
        explicitUndefinedField: 'ignore' | 'delete field'
    },
    t: PersonasTransaction<'readwrite'>,
): Promise<void> {
    const _old = await t.objectStore('personas').get(nextRecord.identifier.toText())
    if (!_old) throw new TypeError('Update an non-exist data')
    const old = personaRecordOutDB(_old)
    let nextLinkedProfiles = old.linkedProfiles
    if (nextRecord.linkedProfiles) {
        if (howToMerge.linkedProfiles === 'merge')
            nextLinkedProfiles = new IdentifierMap(
                new Map([...nextLinkedProfiles.__raw_map__, ...nextRecord.linkedProfiles.__raw_map__]),
            )
        else nextLinkedProfiles = nextRecord.linkedProfiles
    }
    if (howToMerge.explicitUndefinedField === 'ignore') {
        for (const _key in nextRecord) {
            const key = _key as keyof typeof nextRecord
            if (nextRecord[key] === undefined) {
                delete nextRecord[key as keyof typeof nextRecord]
            }
        }
    }
    const next: PersonaRecordDB = personaRecordToDB({
        ...old,
        ...nextRecord,
        linkedProfiles: nextLinkedProfiles,
        updatedAt: nextRecord.updatedAt ?? new Date(),
    })
    await t.objectStore('personas').put(next)
    ;(next.privateKey || old.privateKey) && MaskMessage.events.ownPersonaChanged.sendToAll(undefined)
}

export async function createOrUpdatePersonaDB(
    record: Partial<PersonaRecord> & Pick<PersonaRecord, 'identifier' | 'publicKey'>,
    howToMerge: Parameters<typeof updatePersonaDB>[1],
    t: PersonasTransaction<'readwrite'>,
) {
    if (await t.objectStore('personas').get(record.identifier.toText())) return updatePersonaDB(record, howToMerge, t)
    else
        return createPersonaDB(
            {
                ...record,
                createdAt: record.createdAt ?? new Date(),
                updatedAt: record.updatedAt ?? new Date(),
                linkedProfiles: new IdentifierMap(new Map()),
            },
            t,
        )
}

/**
 * Delete a Persona
 */
export async function deletePersonaDB(
    id: PersonaIdentifier,
    confirm: 'delete even with private' | "don't delete if have private key",
    t: PersonasTransaction<'readwrite'>,
): Promise<void> {
    const r = await t.objectStore('personas').get(id.toText())
    if (!r) return
    if (confirm !== 'delete even with private' && r.privateKey)
        throw new TypeError('Cannot delete a persona with a private key')
    await t.objectStore('personas').delete(id.toText())
    r.privateKey && MaskMessage.events.ownPersonaChanged.sendToAll()
}
/**
 * Delete a Persona
 * @returns a boolean. true: the record no longer exists; false: the record is kept.
 */
export async function safeDeletePersonaDB(
    id: PersonaIdentifier,
    t?: FullPersonaDBTransaction<'readwrite'>,
): Promise<boolean> {
    t = t || createTransaction(await db(), 'readwrite')('personas', 'profiles', 'relations')
    const r = await queryPersonaDB(id, t)
    if (!r) return true
    if (r.linkedProfiles.size !== 0) return false
    if (r.privateKey) return false
    await deletePersonaDB(id, "don't delete if have private key", t)
    return true
}

/**
 * Create a new profile.
 */
export async function createProfileDB(record: ProfileRecord, t: ProfileTransaction<'readwrite'>): Promise<void> {
    await t.objectStore('profiles').add(profileToDB(record))
    MaskMessage.events.profilesChanged.sendToAll([{ of: record.identifier, reason: 'update' }])
}

/**
 * Query a profile.
 */
export async function queryProfileDB(
    id: ProfileIdentifier,
    t?: ProfileTransaction<'readonly'>,
): Promise<ProfileRecord | null> {
    t = t || createTransaction(await db(), 'readonly')('profiles')
    const result = await t.objectStore('profiles').get(id.toText())
    if (result) return profileOutDB(result)
    return null
}

/**
 * Query many profiles.
 */
export async function queryProfilesDB(
    network: string | ((record: ProfileRecord) => boolean),
    t?: ProfileTransaction<'readonly'>,
): Promise<ProfileRecord[]> {
    t = t || createTransaction(await db(), 'readonly')('profiles')
    const result: ProfileRecord[] = []
    if (typeof network === 'string') {
        result.push(
            ...(await t.objectStore('profiles').index('network').getAll(IDBKeyRange.only(network))).map(profileOutDB),
        )
    } else {
        for await (const each of t.objectStore('profiles').iterate()) {
            const out = profileOutDB(each.value)
            if (network(out)) result.push(out)
        }
    }
    return result
}

const fuse = new Fuse([] as ProfileRecord[], {
    shouldSort: true,
    threshold: 0.45,
    minMatchCharLength: 1,
    keys: [
        { name: 'nickname', weight: 0.8 },
        { name: 'identifier.network', weight: 0.2 },
    ],
})

export async function queryProfilesPagedDB(
    options: {
        after?: ProfileIdentifier
        query?: string
    },
    count: number,
): Promise<ProfileRecord[]> {
    const t = createTransaction(await db(), 'readonly')('profiles')
    const breakPoint = options.after?.toText()
    let firstRecord = true
    const data: ProfileRecord[] = []
    for await (const rec of t.objectStore('profiles').iterate()) {
        if (firstRecord && breakPoint && rec.key !== breakPoint) {
            rec.continue(breakPoint)
            firstRecord = false
            continue
        }
        firstRecord = false
        // after this record
        if (rec.key === breakPoint) continue
        if (count <= 0) break
        const outData = profileOutDB(rec.value)
        if (typeof options.query === 'string') {
            fuse.setCollection([outData])
            if (!fuse.search(options.query).length) continue
        }
        count -= 1
        data.push(outData)
    }
    return data
}

/**
 * Update a profile.
 */
export async function updateProfileDB(
    updating: Partial<ProfileRecord> & Pick<ProfileRecord, 'identifier'>,
    t: ProfileTransaction<'readwrite'>,
): Promise<void> {
    const old = await t.objectStore('profiles').get(updating.identifier.toText())
    if (!old) throw new Error('Updating a non exists record')

    const nextRecord: ProfileRecordDB = profileToDB({
        ...profileOutDB(old),
        ...updating,
    })
    await t.objectStore('profiles').put(nextRecord)
    MaskMessage.events.profilesChanged.sendToAll([{ reason: 'update', of: updating.identifier }])
}
export async function createOrUpdateProfileDB(rec: ProfileRecord, t: ProfileTransaction<'readwrite'>) {
    if (await queryProfileDB(rec.identifier, t)) return updateProfileDB(rec, t)
    else return createProfileDB(rec, t)
}

/**
 * Detach a profile from it's linking persona.
 * @param identifier The profile want to detach
 * @param t A living transaction
 */
export async function detachProfileDB(
    identifier: ProfileIdentifier,
    t?: FullPersonaDBTransaction<'readwrite'>,
): Promise<void> {
    t = t || createTransaction(await db(), 'readwrite')('personas', 'profiles', 'relations')
    const profile = await queryProfileDB(identifier, t)
    if (!profile?.linkedPersona) return

    const linkedPersona = profile.linkedPersona
    const persona = await queryPersonaDB(linkedPersona, t)
    persona?.linkedProfiles.delete(identifier)

    if (persona) {
        await updatePersonaDB(persona, { linkedProfiles: 'replace', explicitUndefinedField: 'delete field' }, t)
        if (persona.privateKey) MaskMessage.events.ownPersonaChanged.sendToAll(undefined)
    }
    profile.linkedPersona = undefined
    await updateProfileDB(profile, t)
}

/**
 * attach a profile.
 */
export async function attachProfileDB(
    identifier: ProfileIdentifier,
    attachTo: PersonaIdentifier,
    data: LinkedProfileDetails,
    t?: FullPersonaDBTransaction<'readwrite'>,
): Promise<void> {
    t = t || createTransaction(await db(), 'readwrite')('personas', 'profiles', 'relations')
    const profile =
        (await queryProfileDB(identifier, t)) ||
        (await createProfileDB({ identifier, createdAt: new Date(), updatedAt: new Date() }, t)) ||
        (await queryProfileDB(identifier, t))
    const persona = await queryPersonaDB(attachTo, t)
    if (!persona || !profile) return

    if (profile.linkedPersona !== undefined && !profile.linkedPersona.equals(attachTo)) {
        await detachProfileDB(identifier, t)
    }

    profile.linkedPersona = attachTo
    persona.linkedProfiles.set(identifier, data)

    await updatePersonaDB(persona, { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' }, t)
    await updateProfileDB(profile, t)

    if (persona.privateKey) MaskMessage.events.ownPersonaChanged.sendToAll(undefined)
}

/**
 * Delete a profile
 */
export async function deleteProfileDB(id: ProfileIdentifier, t: ProfileTransaction<'readwrite'>): Promise<void> {
    await t.objectStore('profiles').delete(id.toText())
    MaskMessage.events.profilesChanged.sendToAll([{ reason: 'delete', of: id }])
}

/**
 * Create a new Relation
 */
export async function createRelationDB(
    record: Omit<RelationRecord, 'network'>,
    t: RelationTransaction<'readwrite'>,
): Promise<void> {
    await t.objectStore('relations').add(relationRecordToDB(record))
    MaskMessage.events.relationsChanged.sendToAll([{ of: record.profile, reason: 'update', favor: record.favor }])
}

/**
 * Query relations by paged
 */
export async function queryRelationsPagedDB(
    linked: PersonaIdentifier,
    options: {
        network: string
        after?: RelationRecord
    },
    count: number,
) {
    const t = createTransaction(await db(), 'readonly')('relations')
    let firstRecord = true

    const data: RelationRecord[] = []

    for await (const cursor of t.objectStore('relations').index('linked, profile, favor').iterate()) {
        if (cursor.value.linked !== linked.toText()) continue
        if (
            firstRecord &&
            options.after &&
            options.after.linked.toText() !== cursor?.value.linked &&
            options.after.profile.toText() !== cursor?.value.profile
        ) {
            // @ts-ignore
            cursor.continue([options.after.linked, options.after.profile, options.after.favor])
            firstRecord = false
            continue
        }

        firstRecord = false

        if (
            options.after?.linked.toText() === cursor?.value.linked &&
            options.after?.profile.toText() === cursor?.value.profile
        )
            continue

        if (count <= 0) break
        const outData = relationRecordOutDB(cursor.value)
        count -= 1
        data.push(outData)
    }
    return data
}

/**
 * Update a relation
 * @param updating
 * @param t
 */
export async function updateRelationDB(
    updating: Omit<RelationRecord, 'network'>,
    t: RelationTransaction<'readwrite'>,
): Promise<void> {
    const old = await t
        .objectStore('relations')
        .get(IDBKeyRange.only([updating.linked.toText(), updating.profile.toText()]))

    if (!old) throw new Error('Updating a non exists record')

    const nextRecord: RelationRecordDB = relationRecordToDB({
        ...relationRecordOutDB(old),
        ...updating,
    })

    await t.objectStore('relations').put(nextRecord)
    MaskMessage.events.relationsChanged.sendToAll([{ of: updating.profile, favor: updating.favor, reason: 'update' }])
}

//#endregion

//#region Type
export interface ProfileRecord {
    identifier: ProfileIdentifier
    nickname?: string
    localKey?: AESJsonWebKey
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
    publicKey: EC_Public_JsonWebKey
    privateKey?: EC_Private_JsonWebKey
    localKey?: AESJsonWebKey
    nickname?: string
    linkedProfiles: IdentifierMap<ProfileIdentifier, LinkedProfileDetails>
    createdAt: Date
    updatedAt: Date
    hasLogout?: boolean
    /**
     * create a dummy persona which should hide to the user until
     * connected at least one SNS identity
     */
    uninitialized?: boolean
}

export interface RelationRecord {
    profile: ProfileIdentifier
    linked: PersonaIdentifier
    network: string
    favor: 0 | 1
}

type ProfileRecordDB = Omit<ProfileRecord, 'identifier' | 'hasPrivateKey'> & {
    identifier: string
    network: string
    linkedPersona?: PrototypeLess<PersonaIdentifier>
}

type PersonaRecordDB = Omit<PersonaRecord, 'identifier' | 'linkedProfiles'> & {
    identifier: string
    linkedProfiles: Map<string, LinkedProfileDetails>
    /**
     * This field is used as index of the db.
     */
    hasPrivateKey: 'no' | 'yes'
}
type RelationRecordDB = Omit<RelationRecord, 'profile' | 'linked'> & {
    network: string
    profile: string
    linked: string
}

export interface PersonaDB extends DBSchema {
    /** Use inline keys */
    personas: {
        value: PersonaRecordDB
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
    /** Use inline keys **/
    relations: {
        key: IDBValidKey[]
        value: RelationRecordDB
        indexes: {
            'linked, profile, favor': string
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
        identifier: Identifier.fromString(x.identifier, ProfileIdentifier).unwrap(),
        linkedPersona: restorePrototype(x.linkedPersona, ECKeyIdentifier.prototype),
    }
}
function personaRecordToDB(x: PersonaRecord): PersonaRecordDB {
    return {
        ...x,
        identifier: x.identifier.toText(),
        hasPrivateKey: x.privateKey ? 'yes' : 'no',
        linkedProfiles: x.linkedProfiles.__raw_map__,
    }
}
function personaRecordOutDB(x: PersonaRecordDB): PersonaRecord {
    // @ts-ignore
    delete x.hasPrivateKey
    const obj: PersonaRecord = {
        ...x,
        identifier: Identifier.fromString(x.identifier, ECKeyIdentifier).unwrap(),
        linkedProfiles: new IdentifierMap(x.linkedProfiles, ProfileIdentifier),
    }
    return obj
}

function relationRecordToDB(x: Omit<RelationRecord, 'network'>): RelationRecordDB {
    return {
        ...x,
        network: x.profile.network,
        profile: x.profile.toText(),
        linked: x.linked.toText(),
    }
}

function relationRecordOutDB(x: RelationRecordDB): RelationRecord {
    return {
        ...x,
        profile: Identifier.fromString(x.profile, ProfileIdentifier).unwrap(),
        linked: Identifier.fromString(x.linked, ECKeyIdentifier).unwrap(),
    }
}

function findRelationRecordWithLinked(x: RelationRecordDB, linked: PersonaIdentifier) {
    return linked.equals(Identifier.fromString(x.linked, ECKeyIdentifier).unwrap())
}

//#endregion
