import { getMyPrivateKey, storeKey, getAllKeys, PersonCryptoKey } from './db'
import * as db from './db'

export async function generateMyKey(): Promise<PersonCryptoKey & { key: { privateKey: CryptoKey } }> {
    const has = await getMyPrivateKey()
    if (has) throw new TypeError('You already have a key-pair!')

    // tslint:disable-next-line: await-promise
    const mine = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    await storeKey({ username: '$self', key: mine })
    return ((await db.queryPersonCryptoKey('$self'))! as PersonCryptoKey) as any
}
