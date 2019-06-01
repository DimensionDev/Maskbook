import { OnlyRunInContext } from '@holoflows/kit/es'
import { CryptoKeyRecord, toReadCryptoKey, storeKey as storeKeyDB } from '../../key-management/keystore-db'
import { Person, queryPeopleWithQuery } from '../../database'
import { storeDefaultLocalKeyDB } from '../../database/people'

OnlyRunInContext('background', 'FriendService')
export { getMyPrivateKey } from '../../key-management/keystore-db'
export { storeAvatar, getAvatarBlobURL, queryPerson } from '../../database'
export { uploadProvePostUrl } from '../../key-management/people-gun'
/**
 * Query all people stored
 */
export async function queryPeople(network: string): Promise<Person[]> {
    return queryPeopleWithQuery((k, r) => !!(k.network === network && r.publicKey))
}
/**
 * Store Key for myself
 * @param key Key to be stored
 */
export async function storeMyKey(key: { key: CryptoKeyRecord; local: JsonWebKey }) {
    const k = await toReadCryptoKey(key.key)
    const a = storeKeyDB(k)
    const b = storeDefaultLocalKeyDB(
        await crypto.subtle.importKey('jwk', key.local, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']),
    )
    await a
    await b
    console.log('Keypair restored.', key)
}
