import { Omit } from '@material-ui/core'
import { Entity, Index, Db, Key } from 'typed-db'
import { buildQuery } from '../utils/utils'
import { MessageCenter } from '../utils/messages'
import { encodeArrayBuffer, encodeText } from '../utils/EncodeDecode'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { memoize } from 'lodash-es'
import { queryAvatar } from './avatar-db'

OnlyRunInContext('background', 'Key Store')
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
    const fingerprint = await calculateFingerprint(key)
    queryAvatar(key.username).then(avatar =>
        MessageCenter.send('newPerson', {
            username: key.username,
            avatar: avatar,
            fingerprint: fingerprint,
        }),
    )
    return query(t => t.put(k), 'readwrite')
}
export async function getMyPrivateKey(): Promise<PersonCryptoKey & PersonCryptoKeyWithPrivate<true> | null> {
    const record = await queryPersonCryptoKey('$self')
    return (record as any) || null
}
const isPersonCryptoKey = (x: any): x is Omit<PersonCryptoKey, 'fingerprint'> => !!x.username
async function _calculateFingerprint(key: JsonWebKey | Omit<PersonCryptoKey, 'fingerprint'> | string) {
    if (typeof key === 'string') {
        // tslint:disable-next-line: no-parameter-reassignment
        key = (await queryPersonCryptoKey(key))!
    }
    if (isPersonCryptoKey(key)) {
        const store = await toStoreCryptoKey(key)
        // tslint:disable-next-line: no-parameter-reassignment
        key = store.key.publicKey
    }
    const hash = await crypto.subtle.digest('SHA-256', encodeText(key.x! + key.y))
    return encodeArrayBuffer(hash)
}
export const calculateFingerprint = memoize(_calculateFingerprint)
//#region Store & Read CryptoKey
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
//#endregion

//#region Generate a new private key
export async function generateNewKey(): Promise<PersonCryptoKey & PersonCryptoKeyWithPrivate<true>> {
    const has = await getMyPrivateKey()
    if (has) throw new TypeError('You already have a key-pair!')

    const mine = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    await storeKey({ username: '$self', key: mine })
    return (await queryPersonCryptoKey('$self')) as PersonCryptoKey & PersonCryptoKeyWithPrivate<true>
}
//#endregion
Object.assign(window, {
    db: {
        getAllKeys,
        queryPersonCryptoKey,
        storeKey,
        getMyPrivateKey,
        toStoreCryptoKey,
        calculateFingerprint,
        toReadCryptoKey,
    },
})
