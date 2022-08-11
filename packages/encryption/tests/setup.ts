import { test } from '@jest/globals'
import { atob, btoa } from 'buffer'
import { polyfill } from '@dimensiondev/secp256k1-webcrypto/node'
import '../../shared-base/node_modules/tiny-secp256k1'

test('Setup env', () => {})

if (!Reflect.get(globalThis, 'crypto')) {
    polyfill()
    Object.assign(globalThis, { atob, btoa })
}
