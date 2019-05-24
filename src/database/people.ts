import { Relation, PersonIdentifier, Identifier, GroupIdentifier } from './type'
import { openDB, DBSchema } from 'idb/with-async-ittr'
import { JsonWebKeyToCryptoKey, CryptoKeyToJsonWebKey } from './utils'

//#region Type and utils
async function outDb({ identifier, publicKey, privateKey, ...rest }: PersonDBRecord): Promise<PersonOutDBRecord> {
    // Restore prototype
    rest.previousIdentifiers.forEach(y => Object.setPrototypeOf(y, PersonIdentifier.prototype))
    rest.groups.forEach(y => Object.setPrototypeOf(y, GroupIdentifier.prototype))
    const result: PersonOutDBRecord = {
        ...rest,
        identifier: Identifier.fromString(identifier) as PersonIdentifier,
    }
    if (publicKey) result.publicKey = await JsonWebKeyToCryptoKey(publicKey)
    if (privateKey) result.privateKey = await JsonWebKeyToCryptoKey(privateKey)
    return result
}
async function toDb({ publicKey, privateKey, ...rest }: PersonOutDBRecord): Promise<PersonDBRecord> {
    const result: PersonDBRecord = { ...rest, identifier: rest.identifier.toString() }
    if (publicKey) result.publicKey = await CryptoKeyToJsonWebKey(publicKey)
    if (privateKey) result.privateKey = await CryptoKeyToJsonWebKey(privateKey)
    return result
}
interface PersonOutDBRecord extends Omit<PersonDBRecord, 'identifier' | 'publicKey' | 'privateKey'> {
    identifier: PersonIdentifier
    publicKey?: CryptoKey
    privateKey?: CryptoKey
}
interface PersonDBRecord {
    identifier: string
    previousIdentifiers: PersonIdentifier[]
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
        value: PersonDBRecord
        key: string
    }
    /** Use inline keys */
    myself: {
        value: PersonDBRecord
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
export async function storeNewPersonDB(record: PersonOutDBRecord): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    await t.objectStore('people').put(await toDb(record))
    return
}
export async function queryPersonDB(id: PersonIdentifier): Promise<null | PersonOutDBRecord> {
    const t = (await db).transaction('people', 'readonly')
    const result = await t.objectStore('people').get(id.toString())
    if (!result) return null
    return outDb(result)
}
export async function updatePersonDB(
    person: Partial<PersonOutDBRecord> & Pick<PersonOutDBRecord, 'identifier'>,
): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    const full = await t.objectStore('people').get(person.identifier.toString())
    if (!full) throw new Error('Person is not in the db')
    const o: PersonDBRecord = { ...full, ...toDb(person as PersonOutDBRecord) }
    await t.objectStore('people').put(o)
}
export async function removePersonDB(people: PersonIdentifier[]): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    for (const person of people) await t.objectStore('people').delete(person.toString())
    return
}
//#endregion
//#region Myself
export async function queryMyIdentityAt(id: PersonIdentifier): Promise<null | PersonOutDBRecord> {
    const t = (await db).transaction('myself')
    const result = await t.objectStore('myself').get(id.toString())
    if (!result) return null
    return outDb(result)
}
export async function storeMyIdentity(record: PersonOutDBRecord): Promise<void> {
    const t = (await db).transaction('myself', 'readwrite')
    await t.objectStore('myself').put(await toDb(record))
}
export async function getMyIdentities(): Promise<PersonOutDBRecord[]> {
    const t = (await db).transaction('myself')
    const result = await t.objectStore('myself').getAll()
    return Promise.all(result.map(outDb))
}
//#endregion
//#region LocalKeys

export async function queryLocalKey(id: PersonIdentifier): Promise<Record<string, CryptoKey> | null> {
    const t = (await db).transaction('localKeys')
    const result = await t.objectStore('localKeys').get(id.toString())
    return result || null
}
/**
 *
 * @param id - Identifier
 * @param key - ! This key MUST BE a native CryptoKey object !
 */
export async function storeLocalKey(id: PersonIdentifier, key: LocalKeys): Promise<void> {
    if (!(key instanceof CryptoKey)) throw new TypeError('It is not a real CryptoKey!')
    const t = (await db).transaction('localKeys', 'readwrite')
    await t.objectStore('localKeys').put(key, id.toString())
}
export async function queryAllLocalKeys() {
    const t = (await db).transaction('localKeys')
    const result: WeakMap<PersonIdentifier, LocalKeys> = new WeakMap()
    // tslint:disable-next-line: await-promise
    for await (const { key, value } of t.objectStore('localKeys')) {
        result.set(Identifier.fromString(key) as PersonIdentifier, value)
    }
    return result
}
//#endregion
