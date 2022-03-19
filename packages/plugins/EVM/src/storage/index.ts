import { getEnumAsArray } from '@dimensiondev/kit'
import { EnhanceableSite, ExtensionSite, ScopedStorage } from '@masknet/shared-base'
import {
    ChainId,
    NetworkType,
    ProviderType,
    FungibleAssetProvider,
    NonFungibleAssetProvider,
    TransactionDataProvider,
    CurrencyType,
    ChainOptions,
} from '@masknet/web3-shared-evm'
import type { MemeoryStorage, PersistentStorage } from '../types'

export const MemoryDefaultValue: MemeoryStorage = {
    chainOptions: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce((accumulator, site) => {
        accumulator[site.value] = {
            chainId: ChainId.Mainnet,
            account: '',
            networkType: NetworkType.Ethereum,
            providerType: ProviderType.MaskWallet,
            assetType: FungibleAssetProvider.DEBANK,
            collectibleType: NonFungibleAssetProvider.OPENSEA,
            transationType: TransactionDataProvider.SCANNER,
            currencyType: CurrencyType.USD,
        }
        return accumulator
    }, {} as Record<EnhanceableSite | ExtensionSite, ChainOptions>),
    gasOptions: null,
    domainAddressBook: {},
    tokenPrices: {},
}

export const PersistentDefaultValue: PersistentStorage = {
    wallets: [],
    transactions: [],
    fungibleTokens: [],
    nonFungibleTokens: [],
    fungibleTokenBlockedBy: new Map(),
    nonFungibleTokenBlockedBy: new Map(),
}

let memory: ScopedStorage<typeof MemoryDefaultValue> = null!
let persistent: ScopedStorage<typeof PersistentDefaultValue> = null!

export function setupMemory(_: typeof memory) {
    memory = _
}

export function getMemory() {
    return memory.storage
}

export function setupPersistent(_: typeof persistent) {
    persistent = _
}

export function getPersistent() {
    return persistent.storage
}
