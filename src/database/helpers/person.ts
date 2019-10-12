import { queryPersonDB, PersonRecord, queryPeopleDB, queryMyIdentityAtDB } from '../people'
import { PersonIdentifier } from '../type'
import { getAvatarDataURL } from './avatar'
import { memoize } from 'lodash-es'
import { CryptoKeyToJsonWebKey } from '../../utils/type-transform/CryptoKey-JsonWebKey'
import { encodeArrayBuffer, encodeText } from '../../utils/type-transform/String-ArrayBuffer'

/**
 * Person in UI do not include publickey / privatekey!
 */
export interface Person extends Omit<PersonRecord, 'publicKey' | 'privateKey'> {
    avatar?: string
    /** Fingerprint for the public key */
    fingerprint?: string
}

export async function personRecordToPerson(record: PersonRecord): Promise<Person> {
    const avatar = await getAvatarDataURL(record.identifier).catch(() => '')
    const { privateKey, publicKey, ...rec } = record
    return {
        ...rec,
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
            avatar: undefined,
        }
    return personRecordToPerson(person)
}

/**
 * Select a set of people
 */
export async function queryPeopleWithQuery(query?: Parameters<typeof queryPeopleDB>[0]): Promise<Person[]> {
    const result = await queryPeopleDB(query)
    return Promise.all(result.map(personRecordToPerson))
}

export const calculateFingerprint = memoize(async function(_key: CryptoKey) {
    const key = await CryptoKeyToJsonWebKey(_key)
    if (!key) return 'Fingerprint not available'
    const hash = await crypto.subtle.digest('SHA-256', encodeText(key.x! + key.y))
    return encodeArrayBuffer(hash)
})

/**
 * Get your id at a network even it is unresolved
 */
export async function getMyPrivateKey(whoAmI: PersonIdentifier) {
    const r1 = await queryMyIdentityAtDB(whoAmI)
    if (r1) return r1
    return queryMyIdentityAtDB(new PersonIdentifier(whoAmI.network, '$self'))
}
