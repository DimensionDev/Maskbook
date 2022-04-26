import { PLUGIN_ID } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin'
import type { SecretRecord, WalletRecord } from '../services/wallet/type'

export const PluginDB = createPluginDatabase<WalletRecord | SecretRecord>(PLUGIN_ID)
