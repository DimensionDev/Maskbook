import type { Plugin } from '@masknet/plugin-infra'
import type { LockerRecord } from '../services/wallet/database/locker.js'
import type { SecretRecord, WalletRecord } from '../services/wallet/type.js'

export let PluginDB: Plugin.Worker.DatabaseStorage<WalletRecord | SecretRecord | LockerRecord>

export function setupDatabase(x: typeof PluginDB) {
    PluginDB = x
}
