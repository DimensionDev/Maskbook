/* eslint-disable import/no-deprecated */
/// <reference path="../global.d.ts" />
/**
 * @deprecated
 * This database is deprecated since Maskbook 1.8.0
 * Do not store new data in it.
 */
/**
 * Database structure:
 *
 * # ObjectStore `people`:
 * @description Store Other people.
 * @type {PersonRecordInDatabase}
 * @keys inline, {@link Person.identifier}
 * @index network
 *
 * # ObjectStore `myself`:
 * @description Store my identities.
 * @type {PersonRecordInDatabase}
 * @keys inline, {@link Person.identifier}
 *
 * # ObjectStore `localKeys`:
 * @description Store local AES keys.
 * @type {Record<string, CryptoKey>} Record of <userId, CryptoKey>
 * @keys outline, string, which means network.
 */
import { GroupIdentifier, Identifier, ProfileIdentifier } from '../type'
import { DBSchema, openDB } from 'idb/with-async-ittr'
import { JsonWebKeyToCryptoKey, getKeyParameter } from '../../utils/type-transform/CryptoKey-JsonWebKey'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('background', 'People db')
//#region Type and utils
/**
 * Transform data out of database
 */
async function outDb({ identifier, publicKey, privateKey, ...rest }: PersonRecordInDatabase): Promise<PersonRecord> {
    // Restore prototype
    rest.previousIdentifiers &&
        rest.previousIdentifiers.forEach(y => Object.setPrototypeOf(y, ProfileIdentifier.prototype))
    rest.groups.forEach(y => Object.setPrototypeOf(y, GroupIdentifier.prototype))
    const result: PersonRecord = {
        ...rest,
        identifier: Identifier.fromString(identifier, ProfileIdentifier).unwrap(
            `Invalid identifier, expected ProfileIdentifier, actual ${identifier}`,
        ),
    }
    if (publicKey) result.publicKey = await JsonWebKeyToCryptoKey(publicKey, ...getKeyParameter('ecdh'))
    if (privateKey) result.privateKey = await JsonWebKeyToCryptoKey(privateKey, ...getKeyParameter('ecdh'))
    return result
}
interface Base<db> {
    identifier: IF<db, string, ProfileIdentifier>
    publicKey?: IF<db, JsonWebKey, CryptoKey>
    privateKey?: IF<db, JsonWebKey, CryptoKey>
}
/**
 * @deprecated
 */
export interface PersonRecord extends Omit<PersonRecordInDatabase, keyof Base<true> | 'network'>, Base<false> {}
/**
 * @deprecated
 */
export type PersonRecordPublic = PersonRecord & Required<Pick<PersonRecord, 'publicKey'>>
/**
 * @deprecated
 */
export type PersonRecordPublicPrivate = PersonRecord & Required<Pick<PersonRecord, 'publicKey' | 'privateKey'>>
interface PersonRecordInDatabase extends Base<true> {
    network: string
    previousIdentifiers?: ProfileIdentifier[]
    nickname?: string
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
 * Query person with an identifier
 * @deprecated
 */
export async function queryPeopleDB(
    query: ((key: ProfileIdentifier, record: PersonRecordInDatabase) => boolean) | { network: string } = () => true,
): Promise<PersonRecord[]> {
    const t = (await db).transaction('people')
    const result: PersonRecordInDatabase[] = []
    if (typeof query === 'function') {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        for await (const { value, key } of t.store) {
            const id = Identifier.fromString(key, ProfileIdentifier).value
            if (!id) {
                console.warn('Found invalid identifier', key)
                continue
            }
            if (query(id, value)) result.push(value)
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

//#endregion
//#region Myself
/**
 * Get all my identities.
 * @deprecated
 */
export async function getMyIdentitiesDB(): Promise<PersonRecordPublicPrivate[]> {
    const t = (await db).transaction('myself')
    const result = await t.objectStore('myself').getAll()
    return Promise.all(result.map(outDb)) as Promise<PersonRecordPublicPrivate[]>
}
//#region LocalKeys

/**
 *
 * @param network
 * @deprecated
 */
export async function queryLocalKeyDB(network: string): Promise<LocalKeys>
export async function queryLocalKeyDB(identifier: ProfileIdentifier): Promise<CryptoKey | null>
export async function queryLocalKeyDB(identifier: string | ProfileIdentifier): Promise<LocalKeys | CryptoKey | null> {
    const t = (await db).transaction('localKeys')
    if (typeof identifier === 'string') {
        const result = await t.objectStore('localKeys').get(identifier)
        return result || {}
    } else {
        const store = await queryLocalKeyDB(identifier.network)
        return store[identifier.userId] || null
    }
}
