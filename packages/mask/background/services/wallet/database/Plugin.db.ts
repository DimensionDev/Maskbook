import type { LockerRecord } from '../services/wallet/database/locker.js'
import type { SecretRecord, WalletRecord } from '../services/wallet/type.js'
import { createPluginDatabase } from '../../../database/plugin-db/wrap-plugin-database.js'
import { PluginID } from '@masknet/shared-base'
import type { WalletGrantedPermission, InternalWalletConnectRecord } from './types.js'

// Note: Wallet was a plugin in the past, but now it's a core service in Mask.
export const walletDatabase = createPluginDatabase<
    WalletRecord | SecretRecord | LockerRecord | WalletGrantedPermission | InternalWalletConnectRecord
>(PluginID.Wallet)
