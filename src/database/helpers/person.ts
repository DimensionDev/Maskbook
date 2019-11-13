import { queryPersonDB, PersonRecord, queryPeopleDB, queryMyIdentityAtDB } from '../people'
import { ProfileIdentifier } from '../type'
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
export async function queryPerson(identifier: ProfileIdentifier): Promise<Person> {
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

const calculateFingerprint = memoize(async function(_key: CryptoKey) {
    const key = await CryptoKeyToJsonWebKey(_key)
    if (!key) return 'Fingerprint not available'
    const hash = await crypto.subtle.digest('SHA-256', encodeText(key.x! + key.y))
    return encodeArrayBuffer(hash)
})
