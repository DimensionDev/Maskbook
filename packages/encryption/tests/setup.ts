import { test } from '@jest/globals'
import { webcrypto } from 'crypto'
import { atob, btoa } from 'buffer'
import { importAsymmetryKeyFromJsonWebKeyOrSPKI, PublicKeyAlgorithmEnum } from '../src'
import type { EC_Public_CryptoKey } from '@masknet/shared-base'

test('Setup env', () => {})

const ECDH_K256_PublicKey = {
    /* cspell:disable-next-line */
    x: 'r9tVYAq-h0m5REaTd6eMTWBSK7ZIQszwggoiU0ao5Yw',
    /* cspell:disable-next-line */
    y: 'kx1ZdZAABlMcRqc_hLM6A3Vd--Vn7FBMRw3SREQN1j4',
    ext: true,
    key_ops: ['deriveKey', 'deriveBits'],
    crv: 'K-256',
    kty: 'EC',
}
export async function ECDH_K256_PublicKey_CryptoKey(): Promise<EC_Public_CryptoKey> {
    const x = await importAsymmetryKeyFromJsonWebKeyOrSPKI(ECDH_K256_PublicKey, PublicKeyAlgorithmEnum.secp256k1)
    return x.unwrap() as EC_Public_CryptoKey
}

if (!Reflect.get(globalThis, 'crypto')) {
    Object.assign(globalThis, {
        crypto: webcrypto,
        atob,
        btoa,
        self: globalThis,
        navigator: {
            userAgent: 'Chrome/99.0.0.0',
        },
    })

    // @ts-ignore
    await import('../../polyfills/dist/secp256k1.js')
    Reflect.deleteProperty(globalThis, 'navigator')
    Reflect.deleteProperty(globalThis, 'self')
}
