import { OnlyRunInContext } from '@holoflows/kit/es'
import {
    queryPeopleCryptoKey,
    calculateFingerprint,
    CryptoKeyRecord,
    toReadCryptoKey,
    storeKey as storeKeyDB,
    queryPersonCryptoKey,
    getMyPrivateKey as getMyPrivateKeyDB,
} from '../../key-management/keystore-db'
import {
    queryAvatar as queryAvatarDB,
    storeAvatar as storeAvatarDB,
    queryNickname,
} from '../../key-management/avatar-db'
import { storeLocalKey } from '../../key-management/local-db'
import { uploadProvePostUrl as uploadProvePostUrlDB } from '../../key-management/people-gun'

OnlyRunInContext('background', 'FriendService')
export interface Person {
    username: string
    nickname?: string
    avatar?: string
    fingerprint?: string
}
export const getMyPrivateKey = getMyPrivateKeyDB
export const storeAvatar = storeAvatarDB
export const queryAvatar = queryAvatarDB
export const uploadProvePostUrl = uploadProvePostUrlDB
/**
 * Query a single person. If this person is not stored, will return a { username }
 * @param username Username for quest
 */
export async function queryPerson(username: string): Promise<Person> {
    const avatar = queryAvatarDB(username)
    const nickname = queryNickname(username)
    const key = await queryPersonCryptoKey(username)
    return {
        username: username,
        fingerprint: key ? await calculateFingerprint(key) : undefined,
        avatar: await avatar,
        nickname: await nickname,
    }
}
/**
 * Query all people stored
 */
export async function queryPeople(): Promise<Person[]> {
    const keys = await queryPeopleCryptoKey()
    return Promise.all(keys.map<Promise<Person>>(k => queryPerson(k.username)))
}
/**
 * Store Key for myself
 * @param key Key to be stored
 */
export async function storeMyKey(key: { key: CryptoKeyRecord; local: JsonWebKey }) {
    const k = await toReadCryptoKey(key.key)
    const a = storeKeyDB(k)
    const b = storeLocalKey(
        await crypto.subtle.importKey('jwk', key.local, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']),
    )
    await a
    await b
    console.log('Keypair restored.', key)
}
