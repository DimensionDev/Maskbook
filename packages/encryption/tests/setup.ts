import { test } from '@jest/globals'
import { webcrypto } from 'crypto'
import { atob, btoa } from 'buffer'

test('Setup env', () => {})

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
