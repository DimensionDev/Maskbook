import type * as Crypto from './crypto'
import type { decryptionWithSocialNetworkDecoding } from './crypto/decryption'
import type * as Helper from './helper'
import type * as Backup from './backup'
import type * as Identity from './identity'
import type * as Settings from './settings'
import type * as SocialNetwork from './site-adaptors'
import type * as ThirdPartyPlugin from './third-party-plugins'

export type CryptoService = typeof Crypto
export type IdentityService = typeof Identity
export type BackupService = typeof Backup
export type HelperService = typeof Helper
export type SettingsService = typeof Settings
export type SocialNetworkService = typeof SocialNetwork
export type ThirdPartyPluginService = typeof ThirdPartyPlugin
export interface Services {
    Crypto: CryptoService
    Identity: IdentityService
    Backup: BackupService
    Helper: HelperService
    Settings: SettingsService
    SocialNetwork: SocialNetworkService
    ThirdPartyPlugin: ThirdPartyPluginService
}
export type GeneratorServices = {
    decryption: typeof decryptionWithSocialNetworkDecoding
}
