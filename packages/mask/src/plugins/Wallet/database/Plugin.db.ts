import type {
    SecretRecord,
    WalletRecord,
} from '../services/wallet/type'
import type { Plugin } from '@masknet/plugin-infra'

export let PluginDB: Plugin.Worker.DatabaseStorage<
    | WalletRecord
    | SecretRecord
>

export function setupDatabase(x: typeof PluginDB) {
    PluginDB = x
}
