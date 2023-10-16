import type * as Crypto from './crypto/index.js'
import type { decryptWithDecoding } from './crypto/decryption.js'
import type * as Helper from './helper/index.js'
import type * as Backup from './backup/index.js'
import type * as Identity from './identity/index.js'
import type * as Settings from './settings/index.js'
import type * as SiteAdaptor from './site-adaptors/index.js'
import type * as Wallet from './wallet/services/index.js'

export type CryptoService = typeof Crypto
export type IdentityService = typeof Identity
export type BackupService = typeof Backup
export type HelperService = typeof Helper
export type SettingsService = typeof Settings
export type SiteAdaptorService = typeof SiteAdaptor
export type WalletService = typeof Wallet
export interface Services {
    Crypto: CryptoService
    Identity: IdentityService
    Backup: BackupService
    Helper: HelperService
    Settings: SettingsService
    SiteAdaptor: SiteAdaptorService
    Wallet: WalletService
}
export type GeneratorServices = {
    decrypt: typeof decryptWithDecoding
}
