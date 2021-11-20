import { Ok } from 'ts-results'
import { CryptoException, EKindsError } from '../types'
import { importAESFromJWK } from '../utils'

const import_AES_GCM_256 = EKindsError.withErr(importAESFromJWK.AES_GCM_256, CryptoException.InvalidCryptoKey)

/**
 * @internal
 * In payload version 38, the AES key is encrypted by this key.
 */
const v38PublicSharedJwk: JsonWebKey = {
    alg: 'A256GCM',
    ext: true,
    /* cspell:disable-next-line */
    k: '3Bf8BJ3ZPSMUM2jg2ThODeLuRRD_-_iwQEaeLdcQXpg',
    key_ops: ['encrypt', 'decrypt'],
    kty: 'oct',
}

let v38PublicSharedCryptoKey: CryptoKey

export async function get_v38PublicSharedCryptoKey() {
    if (v38PublicSharedCryptoKey) return Ok(v38PublicSharedCryptoKey)

    const imported = await import_AES_GCM_256(v38PublicSharedJwk)
    if (imported.err) return imported
    v38PublicSharedCryptoKey = imported.val
    return Ok(v38PublicSharedCryptoKey)
}
