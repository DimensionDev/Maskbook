// import { createPluginDatabase } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from '../constants'
import type { SecretRecord, WalletRecord } from '../type'

export const PluginDB = createPluginDatabase<WalletRecord | SecretRecord>(PLUGIN_IDENTIFIER)
