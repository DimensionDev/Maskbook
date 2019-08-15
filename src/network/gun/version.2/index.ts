import Gun from 'gun/gun'
import 'gun/sea'
import { gun2Servers } from '../../gun-servers'

export * from './people'
export * from './post'

export type PersonOnGun2 = { provePostId?: string } | undefined
export type SharedAESKeyGun2 = {
    encryptedKey: string
    salt: string
    ephemeralKey?: CryptoKey
    ephemeralKeySign?: string
}
export interface PostOnGun2 {
    [cutNBitsFromFront_hash_ReceiversPublicKey: string]: SharedAESKeyGun2[]
}

export interface ApplicationStateInGunVersion2 {
    [sha512_base64_PersonIdentifier_OR_sha512_base64_PostSalt: string]: PersonOnGun2 | PostOnGun2
}

export const gun2 = new Gun<ApplicationStateInGunVersion2>(gun2Servers)
