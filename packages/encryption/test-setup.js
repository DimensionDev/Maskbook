import { atob, btoa } from 'buffer'
import { polyfill } from '@masknet/secp256k1-webcrypto/node'
import '../shared-base/node_modules/tiny-secp256k1'

if (!Reflect.get(globalThis, 'crypto')) {
    polyfill()
    Object.assign(globalThis, { atob, btoa })
}
