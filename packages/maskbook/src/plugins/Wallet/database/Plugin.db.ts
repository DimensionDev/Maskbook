import { PLUGIN_IDENTIFIER } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import type { AddressBookChunk } from '../services/addressBook'
import type { RecentTransactionChunk } from '../services/recentTransactions/database'
import type {
    ERC1155TokenRecord,
    ERC20TokenRecord,
    ERC721TokenRecord,
    SecretRecord,
    WalletRecord,
} from '../services/wallet/type'

export const PluginDB = createPluginDatabase<
    | AddressBookChunk
    | RecentTransactionChunk
    | WalletRecord
    | SecretRecord
    | ERC20TokenRecord
    | ERC721TokenRecord
    | ERC1155TokenRecord
>(PLUGIN_IDENTIFIER)
