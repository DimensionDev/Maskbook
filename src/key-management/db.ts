import { Omit } from '@material-ui/core'
import { Entity, Index, Db, Key } from 'typed-db'
import { buildQuery } from '../utils/utils'
import { MessageCenter } from '../utils/messages'
import { encodeArrayBuffer, encodeText } from '../utils/EncodeDecode'

@Entity()
/** DO NOT Change the name of this class! It is used as key in the db! */
export class CryptoKeyRecord {
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
        publicKey: CryptoKey
    }
    fingerprint: string
}
export type PersonCryptoKeyWithPrivate<T = false> = {
    key: T extends false ? { privateKey?: CryptoKey } : { privateKey: CryptoKey }
}
export async function getAllKeys(): Promise<PersonCryptoKey[]> {
    const record = await query(t => t.openCursor().asList())
    return Promise.all(record.map(toReadCryptoKey))
}
export async function queryPersonCryptoKey(username: string): Promise<PersonCryptoKey | null> {
    const record = await query(t => t.get(username))
    return record ? toReadCryptoKey(record) : null
}
export async function storeKey(key: Omit<PersonCryptoKey & PersonCryptoKeyWithPrivate, 'fingerprint'>) {
    const k = await toStoreCryptoKey(key)
    MessageCenter.send('newKeyStored', key.username)
    return query(t => t.put(k), 'readwrite')
}
export async function getMyPrivateKey(): Promise<PersonCryptoKey & PersonCryptoKeyWithPrivate<true> | null> {
    const record = await queryPersonCryptoKey('$self')
    return (record as any) || null
}
export async function toStoreCryptoKey(
    x: Omit<PersonCryptoKey & PersonCryptoKeyWithPrivate, 'fingerprint'>,
): Promise<CryptoKeyRecord> {
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
    const hash = await crypto.subtle.digest('SHA-256', encodeText(key.x! + key.y))
    return encodeArrayBuffer(hash)
}
export async function toReadCryptoKey(y: CryptoKeyRecord) {
    const pub = await crypto.subtle.importKey('jwk', y.key.publicKey, y.algor, true, y.usages)
    let priv: CryptoKey | undefined = undefined
    if (y.key.privateKey) priv = await crypto.subtle.importKey('jwk', y.key.privateKey, y.algor, true, y.usages)
    return {
        username: y.username,
        key: priv
            ? {
                  privateKey: priv,
                  publicKey: pub,
              }
            : { publicKey: pub },
        fingerprint: await calculateFingerprint(y.key.publicKey),
    } as PersonCryptoKey & PersonCryptoKeyWithPrivate
}
Object.assign(window, {
    queryPersonCryptoKey,
})
