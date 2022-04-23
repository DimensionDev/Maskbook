import type * as Crypto from './crypto'
import type { decryptionWithSocialNetworkDecoding } from './crypto/decryption'
import type * as Helper from './helper'
import type * as Backup from './backup'
import type * as Identity from './identity'
import type * as Settings from './settings'
export interface Services {
    Crypto: Omit<typeof Crypto, 'decryptionWithSocialNetworkDecoding'>
    Identity: typeof Identity
    Backup: typeof Backup
    Helper: typeof Helper
    SocialNetwork: {}
    Settings: typeof Settings
    ThirdPartyPlugin: {}
}
export type GeneratorServices = {
    decryption: typeof decryptionWithSocialNetworkDecoding
}
