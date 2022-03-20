import type { Subscription } from 'use-subscription'
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
    DomainProvider,
} from '@masknet/web3-shared-evm'
import type { MemoryStorage, PersistentStorage } from '../types'

export const MemoryDefaultValue: MemoryStorage = {
    chainOptions: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce((accumulator, site) => {
        accumulator[site.value] = {
            chainId: ChainId.Mainnet,
            account: '',
            providerType: ProviderType.MaskWallet,
            networkType: NetworkType.Ethereum,
            assetType: FungibleAssetProvider.DEBANK,
            nameType: DomainProvider.ENS,
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
    addressBook: [],
    wallets: [],
    transactions: [],
    fungibleTokens: [],
    nonFungibleTokens: [],
    fungibleTokenBlockedBy: {},
    nonFungibleTokenBlockedBy: {},
}

const storage: {
    memory: ScopedStorage<typeof MemoryDefaultValue>
    persistent: ScopedStorage<typeof PersistentDefaultValue>
} = {
    memory: null!,
    persistent: null!,
}

export function setupStorage<
    T extends 'memory' | 'persistent',
    S extends T extends 'memory' ? MemoryStorage : PersistentStorage,
>(type: T, _: ScopedStorage<S>) {
    // @ts-ignore
    storage[type] = _
}

export async function getStorageValue<
    T extends 'memory' | 'persistent',
    N extends T extends 'memory' ? keyof MemoryStorage : keyof PersistentStorage,
    V extends N extends keyof MemoryStorage
        ? MemoryStorage[N]
        : N extends keyof PersistentStorage
        ? PersistentStorage[N]
        : never,
>(type: T, name: N): Promise<V> {
    // @ts-ignore
    return storage[type].storage[name]
}

export async function getStorageSubscription<
    T extends 'memory' | 'persistent',
    N extends T extends 'memory' ? keyof MemoryStorage : keyof PersistentStorage,
    V extends N extends keyof MemoryStorage
        ? MemoryStorage[N]
        : N extends keyof PersistentStorage
        ? PersistentStorage[N]
        : never,
>(type: T, name: N): Promise<Subscription<V>> {
    // @ts-ignore
    return storage[type].storage[name].subscription
}

export async function setStorageValue<
    T extends 'memory' | 'persistent',
    N extends T extends 'memory' ? keyof MemoryStorage : keyof PersistentStorage,
    V extends N extends keyof MemoryStorage
        ? MemoryStorage[N]
        : N extends keyof PersistentStorage
        ? PersistentStorage[N]
        : never,
>(type: T, name: N, value: V): Promise<void> {
    // @ts-ignore
    await storage[type].storage[name].setValue(value)
}
