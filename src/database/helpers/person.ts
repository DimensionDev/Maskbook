import { queryPersonDB, PersonRecord, queryPeopleDB } from '../people'
import { PersonIdentifier, Relation } from '../type'
import { getAvatarBlobURL } from './avatar'
import { memoize } from 'lodash-es'
import { CryptoKeyToJsonWebKey } from '../../utils/type-transform/CryptoKey-JsonWebKey'
import { encodeArrayBuffer, encodeText } from '../../utils/type-transform/String-ArrayBuffer'

export interface Person extends PersonRecord {
    avatar?: string
    /** Fingerprint for the public key */
    fingerprint?: string
}

async function personRecordToPerson(record: PersonRecord): Promise<Person> {
    const avatar = await getAvatarBlobURL(record.identifier)
    return {
        ...record,
        avatar,
        fingerprint: record.publicKey ? await calculateFingerprint(record.publicKey) : undefined,
    }
}

/**
 * Query a person even it is not stored in the database.
 * @param identifier - Identifier for people want to query
 */
export async function queryPerson(identifier: PersonIdentifier): Promise<Person> {
    const person = await queryPersonDB(identifier)
    if (!person)
        return {
            identifier,
            groups: [],
            nickname: identifier.userId,
            previousIdentifiers: [],
            relation: [Relation.unknown],
            relationLastCheckTime: new Date(),
            avatar: undefined,
        }
    return personRecordToPerson(person)
}

/**
 * Select a set of people
 */
export async function queryPeopleWithQuery(query: Parameters<typeof queryPeopleDB>[0]): Promise<Person[]> {
    const result = await queryPeopleDB(query)
    return Promise.all(result.map(personRecordToPerson))
}

const calculateFingerprint = memoize(async function(_key: CryptoKey) {
    const key = await CryptoKeyToJsonWebKey(_key)
    if (!key) return 'Fingerprint not available'
    const hash = await crypto.subtle.digest('SHA-256', encodeText(key.x! + key.y))
    return encodeArrayBuffer(hash)
})
