import { PLUGIN_IDENTIFIER } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import type { AddressBookChunk } from '../services/addressBook'
import type { RecentTransactionChunk } from '../services/recentTransactions/database'
import type { EncryptedWallet, EncryptedWalletPrimaryKey } from './types'

export const PluginDB = createPluginDatabase<
    AddressBookChunk | RecentTransactionChunk | EncryptedWallet | EncryptedWalletPrimaryKey
>(PLUGIN_IDENTIFIER)
