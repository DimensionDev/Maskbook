import { PLUGIN_IDENTIFIER } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import type { AddressBookChunk } from '../services/addressBook'
import type { RecentTransactionChunk } from '../services/recentTransactions/database'
import type { Wallet } from '../services/wollet'

export const PluginDB = createPluginDatabase<AddressBookChunk | RecentTransactionChunk | Wallet>(PLUGIN_IDENTIFIER)
