import type { Plugin } from '@masknet/plugin-infra'
import type { NetworkRecord } from '../services/wallet/database/network.js'
import type { ContactRecord } from '../services/wallet/database/contact.js'
import type { SecretRecord, WalletRecord } from '../services/wallet/type.js'

export let PluginDB: Plugin.Worker.DatabaseStorage<WalletRecord | SecretRecord | NetworkRecord | ContactRecord>

export function setupDatabase(x: typeof PluginDB) {
    PluginDB = x
}
