import type { NetworkRecord } from '../services/wallet/database/network.js'
import type { SecretRecord, WalletRecord } from '../services/wallet/type.js'
import type { Plugin } from '@masknet/plugin-infra'

export let PluginDB: Plugin.Worker.DatabaseStorage<WalletRecord | SecretRecord | NetworkRecord>

export function setupDatabase(x: typeof PluginDB) {
    PluginDB = x
}
