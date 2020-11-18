import '../gun-worker.patch'
import Gun from 'gun/gun'
import 'gun/sea'
import type { EC_Public_JsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'
import { gunServers } from '../../gun-servers'

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
export const gun2 = new Gun<ApplicationStateInGunVersion2>(gunServers)
gun2.opt({ retry: Infinity })
