import { PLUGIN_IDENTIFIER } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import type { AddressBookChunk } from '../services/addressBook'
import type { RecentTransactionChunk } from '../services/recentTransactions/database'
import type { SecretRecord, WalletRecord } from '../services/wallet/type'

export const PluginDB = createPluginDatabase<AddressBookChunk | RecentTransactionChunk | WalletRecord | SecretRecord>(
    PLUGIN_IDENTIFIER,
)
