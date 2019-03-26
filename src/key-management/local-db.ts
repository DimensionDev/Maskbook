import { Entity, Index, Db, Key } from 'typed-db'
import { buildQuery } from '../utils/utils'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('background', 'Local Key Store')
@Entity()
/** DO NOT Change the name of this class! It is used as key in the db! */
class LocalCryptoKeyRecord {
    @Index({ unique: true })
    @Key()
    username!: string
    key!: CryptoKey
}
// ! This keystore is not stable and maybe drop in the future!
const query = buildQuery(new Db('maskbook-localkeystore-demo-v1', 1), LocalCryptoKeyRecord)

export async function getMyLocalKey(): Promise<LocalCryptoKeyRecord> {
    const record = await query(t => t.get('$self'))
    if (!record) {
        const create = await generateAESKey()
        await storeLocalKey('$self', create)
        return { username: '$self', key: create }
    }
    return record
}
async function generateAESKey() {
    return crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, ['encrypt', 'decrypt'])
}
export async function storeLocalKey(username: string, key: CryptoKey) {
    return query(t => t.put({ username: '$self', key }), 'readwrite')
}
//#endregion
Object.assign(window, {})
