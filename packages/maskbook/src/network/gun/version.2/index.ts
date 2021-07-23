import Gun from 'gun/gun'
import 'gun/sea'
import 'gun/lib/radix'
import 'gun/lib/radisk'
import 'gun/lib/store'
import 'gun/lib/rindexed'
import { gunServers } from '../../gun-servers'
import type { EC_Public_JsonWebKey } from '@masknet/shared-base'

export * from './post'

export type PersonOnGun2 = {
    /** @deprecated if you want to use it, cast it to string. */
    //   provePostId?: unknown
    __notInGunButABrand__DO_NOT_USE_THIS__?: never
}
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

export const gun2 = new Gun<ApplicationStateInGunVersion2>({
    peers: gunServers as any,
    localStorage: false,
    radisk: true,
})
gun2.opt({ retry: Infinity })
