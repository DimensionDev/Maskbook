import type * as Crypto from './crypto/index.js'
import type { decryptWithDecoding } from './crypto/decryption.js'
import type * as Helper from './helper/index.js'
import type * as Backup from './backup/index.js'
import type * as Identity from './identity/index.js'
import type * as Settings from './settings/index.js'
import type * as SiteAdaptor from './site-adaptors/index.js'
import type * as ThirdPartyPlugin from './third-party-plugins/index.js'

export type CryptoService = typeof Crypto
export type IdentityService = typeof Identity
export type BackupService = typeof Backup
export type HelperService = typeof Helper
export type SettingsService = typeof Settings
export type SiteAdaptorService = typeof SiteAdaptor
export type ThirdPartyPluginService = typeof ThirdPartyPlugin
export interface Services {
    Crypto: CryptoService
    Identity: IdentityService
    Backup: BackupService
    Helper: HelperService
    Settings: SettingsService
    SiteAdaptor: SiteAdaptorService
    ThirdPartyPlugin: ThirdPartyPluginService
}
export type GeneratorServices = {
    decrypt: typeof decryptWithDecoding
}
