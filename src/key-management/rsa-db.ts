import { Entity, Index, Db, Key } from 'typed-db'
import { buildQuery } from '../utils/utils'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('background', 'RSA Key Store')
@Entity()
/** DO NOT Change the name of this class! It is used as key in the db! */
export class RSACryptoKeyRecord {
    @Index({ unique: true })
    @Key()
    username!: string
    key!: CryptoKeyPair
}
// ! This keystore is not stable and maybe drop in the future!
const query = buildQuery(new Db('maskbook-rsakeystore-demo-v1', 1), RSACryptoKeyRecord)

export async function getMyRSAKeyPair(): Promise<RSACryptoKeyRecord> {
    const record = await query(t => t.get('$self'))
    if (!record) {
        const create = await generateRSAKeyPair()
        await storeRSAKeyPair('$self', create)
        return { username: '$self', key: create }
    }
    return record
}
async function generateRSAKeyPair() {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/RsaHashedKeyGenParams
    return crypto.subtle.generateKey(
        ({
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: 65537,
            hash: 'SHA-256',
        } as any) as RsaHashedKeyGenParams,
        true,
        ['encrypt', 'decrypt'],
    )
}
export async function storeRSAKeyPair(username: string, key: CryptoKeyPair) {
    return query(t => t.put({ username: '$self', key }))
}
//#endregion
Object.assign(window, {
    rsadb: {},
})
