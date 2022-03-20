import type { Web3Plugin } from '@masknet/plugin-infra'
import type { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import type { MaskBaseAPI } from '@masknet/web3-providers'
import type {
    ChainOptions,
    CryptoPrice,
    EthereumRPC_Computed,
    EthereumTransactionConfig,
    GasOptions,
    RecentTransaction,
} from '@masknet/web3-shared-evm'

export interface MemoryStorage {
    /** cached chain options depend on currently visiting site */
    chainOptions: Record<EnhanceableSite | ExtensionSite, ChainOptions>
    /** cached gas options */
    gasOptions: GasOptions | null
    /** cached domain names and addresses */
    domainAddressBook: Web3Plugin.DomainBook
    /** cached token prices */
    tokenPrices: CryptoPrice
}

export interface PersistentStorage {
    /** list of address */
    addressBook: Web3Plugin.AddressBook
    /** list of wallets */
    wallets: (Web3Plugin.Wallet & {
        /** yep: removable, nope: unremovable */
        configurable?: boolean
        /** the derivation path when wallet was created */
        derivationPath?: string
        /** the derivation path when wallet last was derived */
        latestDerivationPath?: string
        /** the Mask SDK stored key info */
        storedKeyInfo?: MaskBaseAPI.StoredKeyInfo
    })[]
    /** list of transactions */
    transactions: (Web3Plugin.RecentTransaction & {
        /** list of transactions that race at the time */
        candidates: Record<string, EthereumTransactionConfig>
        /** computed ethereum RPC */
        computedPayload?: EthereumRPC_Computed
    })[]
    /** list of fungible tokens */
    fungibleTokens: Web3Plugin.FungibleToken[]
    /** list of non-fungible tokens */
    nonFungibleTokens: Web3Plugin.NonFungibleToken[]
    /** a token address maps to a set of wallet address */
    fungibleTokenBlockedBy: Web3Plugin.AddressList
    /** a token address maps to a set of wallet address */
    nonFungibleTokenBlockedBy: Web3Plugin.AddressList
}
