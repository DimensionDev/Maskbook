import { test } from '@jest/globals'
import { webcrypto } from 'crypto'
import { atob, btoa } from 'buffer'

test('Setup env', () => {})

export const ECDH_K256_PublicKey = {
    x: 'r9tVYAq-h0m5REaTd6eMTWBSK7ZIQszwggoiU0ao5Yw',
    /* cspell:disable-next-line */
    y: 'kx1ZdZAABlMcRqc_hLM6A3Vd--Vn7FBMRw3SREQN1j4',
    ext: true,
    key_ops: ['deriveKey', 'deriveBits'],
    crv: 'K-256',
    kty: 'EC',
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
