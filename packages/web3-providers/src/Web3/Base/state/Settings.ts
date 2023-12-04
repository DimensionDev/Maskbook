import type { Subscription } from 'use-subscription'
import {
    createConstantSubscription,
    InMemoryStorages,
    type NetworkPluginID,
    type StorageObject,
} from '@masknet/shared-base'
import {
    CurrencyType,
    GasOptionType,
    SourceType,
    type SettingsState as Web3SettingsState,
} from '@masknet/web3-shared-base'

interface SettingsStorage {
    currencyType: CurrencyType
    gasOptionType: GasOptionType
    fungibleAssetSourceType: SourceType
    nonFungibleAssetSourceType: SourceType
}

export abstract class SettingsState implements Web3SettingsState {
    public storage: StorageObject<SettingsStorage>
    public allowTestnet: Subscription<boolean>
    public currencyType: Subscription<CurrencyType>
    public gasOptionType: Subscription<GasOptionType>
    public fungibleAssetSourceType: Subscription<SourceType>
    public nonFungibleAssetSourceType: Subscription<SourceType>

    constructor(protected pluginID: NetworkPluginID) {
        const { storage } = InMemoryStorages.Web3.createSubScope(`${this.pluginID}_Settings`, {
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

    async setDefaultCurrencyType(currencyType: CurrencyType) {
        await this.storage.currencyType.setValue(currencyType)
    }
}
