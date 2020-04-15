import Gun from 'gun/gun'
import 'gun/sea'
import { gun2Servers } from '../../gun-servers'
import type { EC_Public_JsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'

export * from './people'
export * from './post'

export type PersonOnGun2 =
    | {
          /** @deprecated if you want to use it, cast it to string. */
          provePostId?: unknown
      }
    | undefined
export type SharedAESKeyGun2 = {
    encryptedKey: string
    salt: string
    ephemeralKey?: EC_Public_JsonWebKey
    ephemeralKeySign?: string
}
export interface PostOnGun2 {
    [cutNBitsFromFront_hash_ReceiversPublicKey: string]: SharedAESKeyGun2[]
}

export interface ApplicationStateInGunVersion2 {
    [sha512_base64_ProfileIdentifier_OR_sha512_base64_PostSalt: string]: PersonOnGun2 | PostOnGun2
}
try {
    if (process.env.NODE_ENV === 'test') {
        // @ts-ignore
        Gun.window.rad = require('gun/lib/radix')
    }
} catch {}
export const gun2 = new Gun<ApplicationStateInGunVersion2>(gun2Servers)
gun2.opt({ retry: Infinity })
