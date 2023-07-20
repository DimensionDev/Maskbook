import type { Subscription } from 'use-subscription'
import { createConstantSubscription, InMemoryStorages, type StorageObject } from '@masknet/shared-base'
import {
    CurrencyType,
    GasOptionType,
    SourceType,
    type SettingsState as Web3SettingsState,
} from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'

export interface SettingsStorage {
    currencyType: CurrencyType
    gasOptionType: GasOptionType
    fungibleAssetSourceType: SourceType
    nonFungibleAssetSourceType: SourceType
}

export class SettingsState implements Web3SettingsState {
    public storage: StorageObject<SettingsStorage> = null!
    public allowTestnet?: Subscription<boolean>
    public currencyType?: Subscription<CurrencyType>
    public gasOptionType?: Subscription<GasOptionType>
    public fungibleAssetSourceType?: Subscription<SourceType>
    public nonFungibleAssetSourceType?: Subscription<SourceType>

    constructor(context: Plugin.Shared.SharedUIContext) {
        const { storage } = InMemoryStorages.Web3.createSubScope('Settings', {
            currencyType: CurrencyType.USD,
            gasOptionType: GasOptionType.NORMAL,
            fungibleAssetSourceType: SourceType.DeBank,
            nonFungibleAssetSourceType: SourceType.OpenSea,
        })
        this.storage = storage

        this.allowTestnet = createConstantSubscription(process.env.NODE_ENV === 'development')
        this.currencyType = this.storage.currencyType.subscription
        this.gasOptionType = this.storage.gasOptionType.subscription
        this.fungibleAssetSourceType = this.storage.fungibleAssetSourceType.subscription
        this.nonFungibleAssetSourceType = this.storage.nonFungibleAssetSourceType.subscription
    }

    get ready() {
        return (
            this.storage.currencyType.initialized &&
            this.storage.gasOptionType.initialized &&
            this.storage.fungibleAssetSourceType.initialized &&
            this.storage.nonFungibleAssetSourceType.initialized
        )
    }

    get readyPromise() {
        return Promise.all([
            this.storage.currencyType.initializedPromise,
            this.storage.gasOptionType.initializedPromise,
            this.storage.fungibleAssetSourceType.initializedPromise,
            this.storage.nonFungibleAssetSourceType.initializedPromise,
        ]).then(() => {})
    }
}
