import { createPluginDatabase } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from '../constants'
import type { AddressBookChunk } from '../services/addressBook'
import type { RecentTransactionChunk } from '../database/RecentTransactions'
import type {
    ERC1155TokenRecord,
    ERC20TokenRecord,
    ERC721TokenRecord,
} from '../type'

export const PluginDB = createPluginDatabase<
    | AddressBookChunk
    | RecentTransactionChunk
    | ERC20TokenRecord
    | ERC721TokenRecord
    | ERC1155TokenRecord
>(PLUGIN_IDENTIFIER)
