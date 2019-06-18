/// <reference path="./global.d.ts" />
/**
 * Database structure:
 *
 * # ObjectStore `people`:
 * @description Store Other people.
 * @type {PersonRecordInDatabase}
 * @keys inline, {@link PersonIdentifier.identifier}
 * @index network
 *
 * # ObjectStore `myself`:
 * @description Store my identities.
 * @type {PersonRecordInDatabase}
 * @keys inline, {@link PersonIdentifier.identifier}
 *
 * # ObjectStore `localKeys`:
 * @description Store local AES keys.
 * @type {Record<string, CryptoKey>} Record of <userId, CryptoKey>
 * @keys outline, string, which means network.
 *
 * There is a special localKeys called `defaultKey` stored at network `localhost`
 */
import { PersonIdentifier, Identifier, GroupIdentifier } from './type'
import { openDB, DBSchema } from 'idb/with-async-ittr'
import { JsonWebKeyToCryptoKey, CryptoKeyToJsonWebKey } from '../utils/type-transform/CryptoKey-JsonWebKey'

//#region Type and utils
/**
 * Transform data out of database
 */
async function outDb({ identifier, publicKey, privateKey, ...rest }: PersonRecordInDatabase): Promise<PersonRecord> {
    // Restore prototype
    rest.previousIdentifiers &&
        rest.previousIdentifiers.forEach(y => Object.setPrototypeOf(y, PersonIdentifier.prototype))
    rest.groups.forEach(y => Object.setPrototypeOf(y, GroupIdentifier.prototype))
    const result: PersonRecord = {
        ...rest,
        identifier: Identifier.fromString(identifier) as PersonIdentifier,
    }
    if (publicKey) result.publicKey = await JsonWebKeyToCryptoKey(publicKey)
    if (privateKey) result.privateKey = await JsonWebKeyToCryptoKey(privateKey)
    return result
}
/**
 * Transform outside data into db format
 */
async function toDb({ publicKey, privateKey, ...rest }: PersonRecord): Promise<PersonRecordInDatabase> {
    const result: PersonRecordInDatabase = {
        ...rest,
        identifier: rest.identifier.toText(),
        network: rest.identifier.network,
    }
    if (publicKey) result.publicKey = await CryptoKeyToJsonWebKey(publicKey)
    if (privateKey) result.privateKey = await CryptoKeyToJsonWebKey(privateKey)
    return result
}
export interface PersonRecord
    extends Omit<PersonRecordInDatabase, 'identifier' | 'publicKey' | 'privateKey' | 'network'> {
    identifier: PersonIdentifier
    publicKey?: CryptoKey
    privateKey?: CryptoKey
}
export type PersonRecordPublic = PersonRecord & Required<Pick<PersonRecord, 'publicKey'>>
export function isPersonRecordPublic(data: PersonRecord): data is PersonRecordPublic {
    return 'publicKey' in data
}
export type PersonRecordPublicPrivate = PersonRecord & Required<Pick<PersonRecord, 'publicKey' | 'privateKey'>>
export function isPersonRecordPublicPrivate(data: PersonRecord): data is PersonRecordPublicPrivate {
    return 'publicKey' in data && 'privateKey' in data
}
interface PersonRecordInDatabase {
    identifier: string
    network: string
    previousIdentifiers?: PersonIdentifier[]
    nickname?: string
    publicKey?: JsonWebKey
    privateKey?: JsonWebKey
    groups: GroupIdentifier[]
}
type LocalKeys = Record<string, CryptoKey | undefined>
interface PeopleDB extends DBSchema {
    /** Use inline keys */
    people: {
        value: PersonRecordInDatabase
        key: string
        indexes: {
            // Use `network` field as index
            network: string
        }
    }
    /** Use inline keys */
    myself: {
        value: PersonRecordInDatabase
        key: string
    }
    /** Use `network` as out-of-line keys */
    localKeys: {
        value: LocalKeys
        key: string
    }
}
const db = openDB<PeopleDB>('maskbook-people-v2', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
        function v0_v1() {
            // inline keys
            db.createObjectStore('people', { keyPath: 'identifier' })
            // inline keys
            db.createObjectStore('myself', { keyPath: 'identifier' })
            db.createObjectStore('localKeys')

            transaction.objectStore('people').createIndex('network', 'network', { unique: false })
        }
        if (oldVersion < 1) v0_v1()
    },
})
//#endregion
//#region Other people
/**
 * Store a new person
 * @param record - PersonRecord
 */
export async function storeNewPersonDB(record: PersonRecord): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    await t.objectStore('people').put(await toDb(record))
    // TODO: Send new person message
    return
}
/**
 * Query person with a identifier
 * @param id - Identifier
 */
export async function queryPeopleDB(
    query: ((key: PersonIdentifier, record: PersonRecordInDatabase) => boolean) | { network: string },
): Promise<PersonRecord[]> {
    const t = (await db).transaction('people')
    const result: PersonRecordInDatabase[] = []
    if (typeof query === 'function') {
        // tslint:disable-next-line: await-promise
        for await (const { value, key } of t.store) {
            if (query(Identifier.fromString(key) as PersonIdentifier, value)) result.push(value)
        }
    } else {
        result.push(
            ...(await t
                .objectStore('people')
                .index('network')
                .getAll(IDBKeyRange.only(query.network))),
        )
    }
    return Promise.all(result.map(outDb))
}
/**
 * Query people within a network
 * @param id - Identifier
 */
export async function queryPersonDB(id: PersonIdentifier): Promise<null | PersonRecord> {
    const t = (await db).transaction('people', 'readonly')
    const result = await t.objectStore('people').get(id.toText())
    if (!result) return null
    return outDb(result)
}
/**
 * Update Person info with a identifier
 * @param person - Partial of person record
 */
export async function updatePersonDB(person: Partial<PersonRecord> & Pick<PersonRecord, 'identifier'>): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    const full = await t.objectStore('people').get(person.identifier.toText())
    if (!full) throw new Error('Person is not in the db')
    const o: PersonRecordInDatabase = { ...full, ...(await toDb(person as PersonRecord)) }
    // TODO: Send new person message
    await t.objectStore('people').put(o)
}
/**
 * Remove people from database
 * @param people - People to remove
 */
export async function removePersonDB(people: PersonIdentifier[]): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    for (const person of people) await t.objectStore('people').delete(person.toText())
    return
}
//#endregion
//#region Myself
/**
 * Get my record
 * @param id - Identifier
 */
export async function queryMyIdentityAtDB(id: PersonIdentifier): Promise<null | PersonRecordPublicPrivate> {
    const t = (await db).transaction('myself')
    const result = await t.objectStore('myself').get(id.toText())
    if (!result) return null
    return outDb(result) as Promise<PersonRecordPublicPrivate>
}
/**
 * Store my record
 * @param record - Record
 */
export async function storeMyIdentityDB(record: PersonRecordPublicPrivate): Promise<void> {
    if (!record.publicKey || !record.privateKey)
        throw new TypeError('No public/private key pair found when store self identity')
    const t = (await db).transaction('myself', 'readwrite')
    await t.objectStore('myself').put(await toDb(record))
}
/**
 * Get all my identities.
 */
export async function getMyIdentitiesDB(): Promise<PersonRecordPublicPrivate[]> {
    const t = (await db).transaction('myself')
    const result = await t.objectStore('myself').getAll()
    return Promise.all(result.map(outDb)) as Promise<PersonRecordPublicPrivate[]>
}
/**
 * Generate a new identity
 */
export async function generateMyIdentityDB(identifier: PersonIdentifier): Promise<void> {
    const now = await getMyIdentitiesDB()
    if (now.some(id => id.identifier.equals(identifier))) return
    const key = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    await storeMyIdentityDB({
        groups: [],
        identifier,
        publicKey: key.publicKey,
        privateKey: key.privateKey,
    })
}
//#endregion
//#region LocalKeys
function generateAESKey(exportable: boolean) {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, exportable, ['encrypt', 'decrypt'])
}
/**
 * Get local key (even there isn't one)
 */
export async function getDefaultLocalKeyOrGenerateOneDB() {
    const orig = await getDefaultLocalKeyDB()
    if (orig) return orig
    return generateLocalKeyDB('default')
}
/**
 * Generate a new local key and store it
 * @param id - Identifier or 'default'
 * @param exportable - If the key is exportable
 */
export async function generateLocalKeyDB(id: PersonIdentifier | 'default', exportable = true) {
    const key = await generateAESKey(exportable)
    if (id === 'default') {
        const orig = await getDefaultLocalKeyDB()
        if (orig) {
            throw new Error('Generate a new default key again?')
        } else await storeDefaultLocalKeyDB(key)
    } else await storeLocalKeyDB(id, key)
    return key
}
/**
 * Store my default local key.
 * @param key - CryptoKey
 */
export function storeDefaultLocalKeyDB(key: CryptoKey) {
    return storeLocalKeyDB(new PersonIdentifier('localhost', 'defaultKey'), key)
}
/**
 * Query my default local key.
 */
export async function getDefaultLocalKeyDB(): Promise<CryptoKey | null> {
    const key = await queryLocalKeyDB('localhost')
    return key.defaultKey || null
}
/**
 *
 * @param network
 */
export async function queryLocalKeyDB(network: string): Promise<LocalKeys> {
    const t = (await db).transaction('localKeys')
    const result = await t.objectStore('localKeys').get(network)
    return result || {}
}
/**
 * Store my local key for a network
 * @param network - Network
 * @param keys - ! Keys MUST BE a native CryptoKey object !
 */
export async function storeLocalKeyDB({ network, userId }: PersonIdentifier, key: CryptoKey): Promise<void> {
    if (!(key instanceof CryptoKey)) {
        throw new TypeError('It is not a real CryptoKey!')
    }
    const t = (await db).transaction('localKeys', 'readwrite')
    const previous = (await t.objectStore('localKeys').get(network)) || {}
    const next = { ...previous, [userId]: key }
    await t.objectStore('localKeys').put(next, network)
}
/**
 * Get all my local keys.
 */
export async function getLocalKeysDB() {
    const t = (await db).transaction('localKeys')
    const result: Map<string, LocalKeys> = new Map()
    // tslint:disable-next-line: await-promise
    for await (const { key, value } of t.objectStore('localKeys')) {
        result.set(key, value)
    }
    return result
}
//#endregion
