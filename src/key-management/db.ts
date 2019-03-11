import { ArrayBufferToString } from '../crypto/crypto'
import { Omit } from '@material-ui/core'
import { Entity, Index, Db, Key } from 'typed-db'
import { buildQuery } from '../utils/utils'
import { MessageCenter } from '../utils/messages'

@Entity()
class CryptoKeyRecord {
    @Index({ unique: true })
    @Key()
    username!: string
    key!: { publicKey: JsonWebKey; privateKey?: JsonWebKey }
    algor!: any
    usages!: string[]
}
// ! This keystore is not stable and maybe drop in the future!
const query = buildQuery(new Db('maskbook-keystore-demo-v2', 1), CryptoKeyRecord)

export type PersonCryptoKey = {
    username: string
    key: {
        privateKey?: CryptoKey
        publicKey: CryptoKey
    }
    fingerprint: string
}
export async function getAllKeys(): Promise<PersonCryptoKey[]> {
    const record = await query(t => t.openCursor().asList())
    return Promise.all(record.map(toRead))
}
export async function queryPersonCryptoKey(username: string): Promise<PersonCryptoKey | null> {
    const record = await query(t => t.get(username))
    return record ? toRead(record) : null
}
export async function storeKey(key: Omit<PersonCryptoKey, 'fingerprint'>) {
    const k = await toStore(key)
    MessageCenter.send('newKeyStored', key.username)
    return query(t => t.add(k), 'readwrite')
}
export async function getMyPrivateKey(): Promise<PersonCryptoKey | null> {
    const record = await queryPersonCryptoKey('$self')
    return record || null
}
async function toStore(x: Omit<PersonCryptoKey, 'fingerprint'>): Promise<CryptoKeyRecord> {
    let priv: JsonWebKey | undefined = undefined,
        pub: JsonWebKey
    if (x.key.privateKey) priv = await crypto.subtle.exportKey('jwk', x.key.privateKey)
    pub = await crypto.subtle.exportKey('jwk', x.key.publicKey!)
    return {
        username: x.username,
        key: { publicKey: pub, privateKey: priv },
        algor: x.key.publicKey!.algorithm!,
        usages: x.key.publicKey!.algorithm.name === 'ECDH' ? ['deriveKey'] : x.key.publicKey!.usages,
    }
}
async function calculateFingerprint(key: JsonWebKey) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key.x! + key.y))
    return ArrayBufferToString(hash)
}
async function toRead(y: CryptoKeyRecord): Promise<PersonCryptoKey> {
    const pub = await crypto.subtle.importKey('jwk', y.key.publicKey, y.algor, true, y.usages)
    let priv: CryptoKey | undefined = undefined
    if (y.key.privateKey) priv = await crypto.subtle.importKey('jwk', y.key.privateKey, y.algor, true, y.usages)
    return {
        username: y.username,
        key: {
            privateKey: priv,
            publicKey: pub,
        },
        fingerprint: await calculateFingerprint(y.key.publicKey),
    } as PersonCryptoKey
}
Object.assign(window, {
    queryPersonCryptoKey,
})
