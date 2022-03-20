import type { Web3Plugin } from '@masknet/plugin-infra'
import type { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import type { ChainOptions, CryptoPrice, GasOptions, RecentTransaction } from '@masknet/web3-shared-evm'

export interface MemoryStorage {
    /** cached chain options depend on currently visiting site */
    chainOptions: Record<EnhanceableSite | ExtensionSite, ChainOptions>
    /** cached gas options */
    gasOptions: GasOptions | null
    /** cached domain names and addresses */
    domainAddressBook: Web3Plugin.DomainAddressBook
    /** cached token prices */
    tokenPrices: CryptoPrice
}

export interface PersistentStorage {
    /** list of wallets */
    wallets: (Web3Plugin.Wallet & {
        /** yep: removable, nope: unremovable */
        configurable: boolean
    })[]
    /** list of transactions */
    transactions: RecentTransaction[]
    /** list of fungible tokens */
    fungibleTokens: Web3Plugin.FungibleToken[]
    /** list of non-fungible tokens */
    nonFungibleTokens: Web3Plugin.NonFungibleToken[]
    /** a token address maps to a set of wallet address */
    fungibleTokenBlockedBy: Record<string, Set<string>>
    /** a token address maps to a set of wallet address */
    nonFungibleTokenBlockedBy: Record<string, Set<string>>
}
