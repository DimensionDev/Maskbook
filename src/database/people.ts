/// <reference path="./global.d.ts" />
import { Relation, PersonIdentifier, Identifier, GroupIdentifier } from './type'
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
    const result: PersonRecordInDatabase = { ...rest, identifier: rest.identifier.toString() }
    if (publicKey) result.publicKey = await CryptoKeyToJsonWebKey(publicKey)
    if (privateKey) result.privateKey = await CryptoKeyToJsonWebKey(privateKey)
    return result
}
export interface PersonRecord extends Omit<PersonRecordInDatabase, 'identifier' | 'publicKey' | 'privateKey'> {
    identifier: PersonIdentifier
    publicKey?: CryptoKey
    privateKey?: CryptoKey
}
interface PersonRecordInDatabase {
    identifier: string
    previousIdentifiers?: PersonIdentifier[]
    nickname: string
    relation: Relation[]
    /** Last check time of relation */
    relationLastCheckTime: Date
    publicKey?: JsonWebKey
    privateKey?: JsonWebKey
    groups: GroupIdentifier[]
}
type LocalKeys = Record<string, CryptoKey>
interface PeopleDB extends DBSchema {
    /** Use inline keys */
    people: {
        value: PersonRecordInDatabase
        key: string
    }
    /** Use inline keys */
    myself: {
        value: PersonRecordInDatabase
        key: string
    }
    /** Use out-of-line keys */
    localKeys: {
        value: LocalKeys
        key: string
    }
}
const db = openDB<PeopleDB>('maskbook-people-v2', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
        // inline keys
        db.createObjectStore('people', { keyPath: 'identifier' })
        db.createObjectStore('myself', { keyPath: 'identifier' })
        db.createObjectStore('localKeys')
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
    return
}
/**
 * Query person with a identifier
 * @param id - Identifier
 */
export async function queryPeopleDB(
    query: (key: PersonIdentifier, record: PersonRecordInDatabase) => boolean,
): Promise<PersonRecord[]> {
    const t = (await db).transaction('people')
    const result: PersonRecordInDatabase[] = []
    // tslint:disable-next-line: await-promise
    for await (const { value, key } of t.store) {
        if (query(Identifier.fromString(key) as PersonIdentifier, value)) result.push(value)
    }
    return Promise.all(result.map(outDb))
}
/**
 * Query people within a network
 * @param id - Identifier
 */
export async function queryPersonDB(id: PersonIdentifier): Promise<null | PersonRecord> {
    const t = (await db).transaction('people', 'readonly')
    const result = await t.objectStore('people').get(id.toString())
    if (!result) return null
    return outDb(result)
}
/**
 * Update Person info with a identifier
 * @param person - Partial of person record
 */
export async function updatePersonDB(person: Partial<PersonRecord> & Pick<PersonRecord, 'identifier'>): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    const full = await t.objectStore('people').get(person.identifier.toString())
    if (!full) throw new Error('Person is not in the db')
    const o: PersonRecordInDatabase = { ...full, ...(await toDb(person as PersonRecord)) }
    await t.objectStore('people').put(o)
}
/**
 * Remove people from database
 * @param people - People to remove
 */
export async function removePersonDB(people: PersonIdentifier[]): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    for (const person of people) await t.objectStore('people').delete(person.toString())
    return
}
//#endregion
//#region Myself
/**
 * Get my record
 * @param id - Identifier
 */
export async function queryMyIdentityAt(id: PersonIdentifier): Promise<null | PersonRecord> {
    const t = (await db).transaction('myself')
    const result = await t.objectStore('myself').get(id.toString())
    if (!result) return null
    return outDb(result)
}
/**
 * Store my record
 * @param record - Record
 */
export async function storeMyIdentity(record: PersonRecord): Promise<void> {
    const t = (await db).transaction('myself', 'readwrite')
    await t.objectStore('myself').put(await toDb(record))
}
/**
 * Get all my identities.
 */
export async function getMyIdentities(): Promise<PersonRecord[]> {
    const t = (await db).transaction('myself')
    const result = await t.objectStore('myself').getAll()
    return Promise.all(result.map(outDb))
}
//#endregion
//#region LocalKeys
/**
 * Query my local key for a idnetifier
 * @param id - Identifier
 */
export async function queryLocalKey(id: PersonIdentifier): Promise<Record<string, CryptoKey> | null> {
    const t = (await db).transaction('localKeys')
    const result = await t.objectStore('localKeys').get(id.toString())
    return result || null
}
/**
 * Store my local key binded with a identifier
 * @param id - Identifier
 * @param key - ! This key MUST BE a native CryptoKey object !
 */
export async function storeLocalKey(id: PersonIdentifier, key: LocalKeys): Promise<void> {
    if (!(key instanceof CryptoKey)) throw new TypeError('It is not a real CryptoKey!')
    const t = (await db).transaction('localKeys', 'readwrite')
    await t.objectStore('localKeys').put(key, id.toString())
}
/**
 * Query all my local keys.
 */
export async function queryAllLocalKeys() {
    const t = (await db).transaction('localKeys')
    const result: Map<PersonIdentifier, LocalKeys> = new Map()
    // tslint:disable-next-line: await-promise
    for await (const { key, value } of t.objectStore('localKeys')) {
        result.set(Identifier.fromString(key) as PersonIdentifier, value)
    }
    return result
}
//#endregion
