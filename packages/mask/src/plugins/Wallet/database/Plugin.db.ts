import type { AddressBookChunk } from '../services/addressBook'
import type { RecentTransactionChunk } from '../services/transaction/database'
import type {
    ERC1155TokenRecord,
    ERC20TokenRecord,
    ERC721TokenRecord,
    SecretRecord,
    WalletRecord,
} from '../services/wallet/type'
import type { Plugin } from '@masknet/plugin-infra'

export let PluginDB: Plugin.Worker.DatabaseStorage<
    | AddressBookChunk
    | RecentTransactionChunk
    | WalletRecord
    | SecretRecord
    | ERC20TokenRecord
    | ERC721TokenRecord
    | ERC1155TokenRecord
>

export function setupDatabase(x: typeof PluginDB) {
    PluginDB = x
}
