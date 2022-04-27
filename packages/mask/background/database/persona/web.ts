import Fuse from 'fuse.js'
import { openDB } from 'idb/with-async-ittr'
import { CryptoKeyToJsonWebKey } from '../../../utils-pure'
import { createDBAccessWithAsyncUpgrade, createTransaction } from '../utils/openDB'
import { assertPersonaDBConsistency } from './consistency'
import {
    AESJsonWebKey,
    convertIdentifierMapToRawMap,
    convertRawMapToIdentifierMap,
    ECKeyIdentifier,
    PersonaIdentifier,
    ProfileIdentifier,
    RelationFavor,
} from '@masknet/shared-base'
import { MaskMessages } from '../../../shared'
import type {
    FullPersonaDBTransaction,
    ProfileTransaction,
    PersonasTransaction,
    RelationTransaction,
    PersonaRecordWithPrivateKey,
    PersonaDB,
    PersonaRecordDB,
    ProfileRecord,
    ProfileRecordDB,
    LinkedProfileDetails,
    RelationRecord,
    RelationRecordDB,
    PersonaRecord,
} from './type'
import { isEmpty } from 'lodash-unified'
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
    4,
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
                    try {
                        db.createObjectStore('relations', { keyPath: ['linked', 'profile'] })
                        transaction
                            .objectStore('relations')
                            .createIndex('linked, profile, favor', ['linked', 'profile', 'favor'], { unique: true })
                    } catch {}
                }
                async function v3_v4() {
                    try {
                        transaction.objectStore('relations').deleteIndex('linked, profile, favor')
                        transaction
                            .objectStore('relations')
                            .createIndex('favor, profile, linked', ['favor', 'profile', 'linked'], { unique: true })
                        const relation = transaction.objectStore('relations')

                        await update(relation)
                        async function update(q: typeof relation) {
                            for await (const rec of relation) {
                                rec.value.favor =
                                    rec.value.favor === RelationFavor.DEPRECATED
                                        ? RelationFavor.UNCOLLECTED
                                        : RelationFavor.COLLECTED

                                await rec.update(rec.value)
                            }
                        }
                    } catch {}
                }
                if (oldVersion < 1) v0_v1()
                if (oldVersion < 2) v1_v2()
                if (oldVersion < 3) v2_v3()
                if (oldVersion < 4) v3_v4()
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
                map.data.set(rec.identifier, (await CryptoKeyToJsonWebKey(rec.localKey as any)) as any)
            }
            return map
        }
        return undefined
    },
)
type V1To2 = { version: 2; data: Map<string, AESJsonWebKey> }
type Knowledge = V1To2

export async function createRelationsTransaction() {
    const database = await db()
    return createTransaction(database, 'readwrite')('relations')
}

export async function createPersonaDBReadonlyAccess(
    action: (t: FullPersonaDBTransaction<'readonly'>) => Promise<void>,
) {
    const database = await db()
    const transaction = createTransaction(database, 'readonly')('personas', 'profiles', 'relations')
    await action(transaction)
}
// @deprecated Please create a transaction directly
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
    const resumePersona = MaskMessages.events.ownPersonaChanged.pause()
    const resumeRelation = MaskMessages.events.relationsChanged.pause()
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
            resumePersona((data) => (data.length ? [undefined] : []))
            resumeRelation((data) => [data.flat()])
        } finally {
            // If the consistency check throws, we drop all pending events
            resumePersona(() => [])
            resumeRelation(() => [])
        }
    }
}

export async function createReadonlyPersonaTransaction() {
    return createTransaction(await db(), 'readonly')
}

// #region Plain methods
/** Create a new Persona. */
export async function createPersonaDB(record: PersonaRecord, t: PersonasTransaction<'readwrite'>): Promise<void> {
    await t.objectStore('personas').add(personaRecordToDB(record))
    record.privateKey && MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}

export async function queryPersonaByProfileDB(
    query: ProfileIdentifier,
    t?: FullPersonaDBTransaction<'readonly'>,
): Promise<PersonaRecord | null> {
    t = t || createTransaction(await db(), 'readonly')('personas', 'profiles', 'relations')
    const x = await t.objectStore('profiles').get(query.toText())
    if (!x?.linkedPersona) return null
    return queryPersonaDB(
        new ECKeyIdentifier(
            x.linkedPersona.curve,
            x.linkedPersona.compressedPoint || x.linkedPersona.encodedCompressedKey!,
        ),
        t,
    )
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
    query?: {
        identifiers?: PersonaIdentifier[]
        hasPrivateKey?: boolean
        nameContains?: string
        initialized?: boolean
    },
    t?: PersonasTransaction<'readonly'>,
    isIncludeLogout?: boolean,
): Promise<PersonaRecord[]> {
    t = t || createTransaction(await db(), 'readonly')('personas')
    const records: PersonaRecord[] = []
    for await (const each of t.objectStore('personas')) {
        const out = personaRecordOutDB(each.value)
        if (
            (query?.hasPrivateKey && !out.privateKey) ||
            (query?.nameContains && out.nickname !== query.nameContains) ||
            (query?.identifiers && !query.identifiers.some((x) => x === out.identifier)) ||
            (query?.initialized && out.uninitialized)
        )
            continue

        if (isIncludeLogout || !out.hasLogout) records.push(out)
    }
    return records
}

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
            nextLinkedProfiles = new Map([...nextLinkedProfiles, ...nextRecord.linkedProfiles])
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
    ;(next.privateKey || old.privateKey) && MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}

export async function createOrUpdatePersonaDB(
    record: Partial<PersonaRecord> & Pick<PersonaRecord, 'identifier' | 'publicKey'>,
    howToMerge: Parameters<typeof updatePersonaDB>[1],
    t: PersonasTransaction<'readwrite'>,
) {
    const personaInDB = await t.objectStore('personas').get(record.identifier.toText())
    if (personaInDB) return updatePersonaDB(record, howToMerge, t)
    else
        return createPersonaDB(
            {
                ...record,
                createdAt: record.createdAt ?? new Date(),
                updatedAt: record.updatedAt ?? new Date(),
                linkedProfiles: record.linkedProfiles ?? new Map(),
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
    r.privateKey && MaskMessages.events.ownPersonaChanged.sendToAll()
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
    query: {
        network?: string
        identifiers?: ProfileIdentifier[]
        hasLinkedPersona?: boolean
    },
    t?: ProfileTransaction<'readonly'>,
): Promise<ProfileRecord[]> {
    t = t || createTransaction(await db(), 'readonly')('profiles')
    const result: ProfileRecord[] = []

    if (isEmpty(query)) {
        const results = await t.objectStore('profiles').getAll()
        results.forEach((each) => {
            const out = profileOutDB(each)
            result.push(out)
        })
    }

    if (query.network) {
        const results = await t.objectStore('profiles').index('network').getAll(IDBKeyRange.only(query.network))

        results.forEach((each) => {
            const out = profileOutDB(each)
            if (query.hasLinkedPersona && !out.linkedPersona) return
            result.push(out)
        })
    } else if (query.identifiers?.length) {
        for await (const each of t.objectStore('profiles').iterate()) {
            const out = profileOutDB(each.value)
            if (query.hasLinkedPersona && !out.linkedPersona) continue
            if (query.identifiers.some((x) => out.identifier === x)) result.push(out)
        }
    } else {
        for await (const each of t.objectStore('profiles').iterate()) {
            const out = profileOutDB(each.value)
            if (query.hasLinkedPersona && !out.linkedPersona) continue
            result.push(out)
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

/**
 * Update a profile.
 */
export async function updateProfileDB(
    updating: Partial<ProfileRecord> & Pick<ProfileRecord, 'identifier'>,
    t: FullPersonaDBTransaction<'readwrite'>,
): Promise<void> {
    const old = await t.objectStore('profiles').get(updating.identifier.toText())
    if (!old) throw new Error('Updating a non exists record')
    const oldLinkedPersona = old.linkedPersona
        ? new ECKeyIdentifier(
              old.linkedPersona.curve,
              old.linkedPersona.compressedPoint || old.linkedPersona.encodedCompressedKey!,
          )
        : undefined

    if (oldLinkedPersona && updating.linkedPersona && oldLinkedPersona !== updating.linkedPersona) {
        const oldIdentifier = ProfileIdentifier.from(old.identifier).unwrap()
        const oldLinkedPersona = await queryPersonaByProfileDB(oldIdentifier, t)

        if (oldLinkedPersona) {
            oldLinkedPersona.linkedProfiles.delete(oldIdentifier)
            await updatePersonaDB(
                oldLinkedPersona,
                {
                    linkedProfiles: 'replace',
                    explicitUndefinedField: 'ignore',
                },
                t,
            )
        }
    }

    if (updating.linkedPersona && oldLinkedPersona !== updating.linkedPersona) {
        const linkedPersona = await queryPersonaDB(updating.linkedPersona, t)
        if (linkedPersona) {
            linkedPersona.linkedProfiles.set(updating.identifier, { connectionConfirmState: 'confirmed' })
            await updatePersonaDB(
                linkedPersona,
                {
                    linkedProfiles: 'replace',
                    explicitUndefinedField: 'ignore',
                },
                t,
            )
        }
    }

    if (old.linkedPersona && updating.linkedPersona && old.linkedPersona !== updating.linkedPersona) {
        const oldIdentifier = Identifier.fromString(old.identifier, ProfileIdentifier).unwrap()
        const oldLinkedPersona = await queryPersonaByProfileDB(oldIdentifier, t)

        if (oldLinkedPersona) {
            oldLinkedPersona.linkedProfiles.delete(oldIdentifier)
            await updatePersonaDB(
                oldLinkedPersona,
                {
                    linkedProfiles: 'replace',
                    explicitUndefinedField: 'ignore',
                },
                t,
            )
        }
    }

    if (updating.linkedPersona && old.linkedPersona !== updating.linkedPersona) {
        const linkedPersona = await queryPersonaDB(updating.linkedPersona, t)
        if (linkedPersona) {
            linkedPersona.linkedProfiles.set(updating.identifier, { connectionConfirmState: 'confirmed' })
            await updatePersonaDB(
                linkedPersona,
                {
                    linkedProfiles: 'replace',
                    explicitUndefinedField: 'ignore',
                },
                t,
            )
        }
    }

    const nextRecord: ProfileRecordDB = profileToDB({
        ...profileOutDB(old),
        ...updating,
    })
    await t.objectStore('profiles').put(nextRecord)
}
export async function createOrUpdateProfileDB(rec: ProfileRecord, t: FullPersonaDBTransaction<'readwrite'>) {
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
        if (persona.privateKey) MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
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

    if (profile.linkedPersona !== undefined && profile.linkedPersona !== attachTo) {
        await detachProfileDB(identifier, t)
    }

    profile.linkedPersona = attachTo
    persona.linkedProfiles.set(identifier, data)

    await updatePersonaDB(persona, { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' }, t)
    await updateProfileDB(profile, t)

    if (persona.privateKey) MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}

/**
 * Delete a profile
 */
export async function deleteProfileDB(id: ProfileIdentifier, t: ProfileTransaction<'readwrite'>): Promise<void> {
    await t.objectStore('profiles').delete(id.toText())
}

/**
 * Create a new Relation
 */
export async function createRelationDB(
    record: Omit<RelationRecord, 'network'>,
    t: RelationTransaction<'readwrite'>,
    silent = false,
): Promise<void> {
    await t.objectStore('relations').add(relationRecordToDB(record))
    if (!silent)
        MaskMessages.events.relationsChanged.sendToAll([{ of: record.profile, reason: 'update', favor: record.favor }])
}

export async function queryRelations(query: (record: RelationRecord) => boolean, t?: RelationTransaction<'readonly'>) {
    t = t || createTransaction(await db(), 'readonly')('relations')
    const records: RelationRecord[] = []

    for await (const each of t.objectStore('relations')) {
        const out = relationRecordOutDB(each.value)
        if (query(out)) records.push(out)
    }

    return records
}

/**
 * Query relations by paged
 */
export async function queryRelationsPagedDB(
    linked: PersonaIdentifier,
    options: {
        network: string
        after?: RelationRecord
        pageOffset?: number
    },
    count: number,
) {
    const t = createTransaction(await db(), 'readonly')('relations')
    let firstRecord = true

    const data: RelationRecord[] = []

    for await (const cursor of t.objectStore('relations').index('favor, profile, linked').iterate()) {
        if (cursor.value.linked !== linked.toText()) continue
        if (cursor.value.network !== options.network) continue

        if (firstRecord && options.after && options.after.profile.toText() !== cursor?.value.profile) {
            cursor.continue([options.after.favor, options.after.profile.toText(), options.after.linked.toText()])
            firstRecord = false
            continue
        }

        firstRecord = false

        // after this record
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
 * @param silent
 */
export async function updateRelationDB(
    updating: Omit<RelationRecord, 'network'>,
    t: RelationTransaction<'readwrite'>,
    silent = false,
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
    if (!silent) {
        MaskMessages.events.relationsChanged.sendToAll([
            { of: updating.profile, favor: updating.favor, reason: 'update' },
        ])
    }
}

export async function createOrUpdateRelationDB(
    record: Omit<RelationRecord, 'network'>,
    t: RelationTransaction<'readwrite'>,
    silent = false,
) {
    const old = await t
        .objectStore('relations')
        .get(IDBKeyRange.only([record.linked.toText(), record.profile.toText()]))

    if (old) {
        await updateRelationDB(record, t, silent)
    } else {
        await createRelationDB(record, t, silent)
    }
}

// #endregion

// #region out db & to db
function profileToDB(x: ProfileRecord): ProfileRecordDB {
    return {
        ...x,
        identifier: x.identifier.toText(),
        network: x.identifier.network,
        linkedPersona: x.linkedPersona
            ? { curve: x.linkedPersona.curve, type: 'ec_key', compressedPoint: x.linkedPersona.publicKey }
            : undefined,
    }
}
function profileOutDB({ network, ...x }: ProfileRecordDB): ProfileRecord {
    if (x.linkedPersona) {
        if (x.linkedPersona.type !== 'ec_key') throw new Error('Unknown type of linkedPersona')
    }
    return {
        ...x,
        identifier: ProfileIdentifier.from(x.identifier).unwrap(),
        linkedPersona: x.linkedPersona
            ? new ECKeyIdentifier(
                  x.linkedPersona.curve,
                  x.linkedPersona.compressedPoint || x.linkedPersona.encodedCompressedKey!,
              )
            : undefined,
    }
}
function personaRecordToDB(x: PersonaRecord): PersonaRecordDB {
    return {
        ...x,
        identifier: x.identifier.toText(),
        hasPrivateKey: x.privateKey ? 'yes' : 'no',
        linkedProfiles: convertIdentifierMapToRawMap(x.linkedProfiles),
    }
}
function personaRecordOutDB(x: PersonaRecordDB): PersonaRecord {
    Reflect.deleteProperty(x, 'hasPrivateKey' as keyof typeof x)
    const identifier = ECKeyIdentifier.from(x.identifier).unwrap()

    const obj: PersonaRecord = {
        ...x,
        identifier,
        publicHexKey: identifier.publicKeyAsHex,
        linkedProfiles: convertRawMapToIdentifierMap(x.linkedProfiles, ProfileIdentifier),
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
        profile: ProfileIdentifier.from(x.profile).unwrap(),
        linked: ECKeyIdentifier.from(x.linked).unwrap(),
    }
}

// #endregion
