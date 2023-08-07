import type { Plugin } from '@masknet/plugin-infra'
import type { NetworkRecord } from '../services/wallet/database/network.js'
import type { LockerRecord } from '../services/wallet/database/locker.js'
import type { SecretRecord, WalletRecord } from '../services/wallet/type.js'

export let PluginDB: Plugin.Worker.DatabaseStorage<WalletRecord | SecretRecord | NetworkRecord | LockerRecord>

export function setupDatabase(x: typeof PluginDB) {
    PluginDB = x
}
