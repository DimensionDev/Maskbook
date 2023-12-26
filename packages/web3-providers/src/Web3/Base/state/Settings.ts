import type { Subscription } from 'use-subscription'
import { createConstantSubscription, type StorageObject } from '@masknet/shared-base'
import {
    type CurrencyType,
    type GasOptionType,
    type SourceType,
    type SettingsState as Web3SettingsState,
} from '@masknet/web3-shared-base'

interface SettingsStorage {
    currencyType: CurrencyType
    gasOptionType: GasOptionType
    fungibleAssetSourceType: SourceType
    nonFungibleAssetSourceType: SourceType
}

export abstract class SettingsState implements Web3SettingsState {
    public allowTestnet: Subscription<boolean>
    public currencyType: Subscription<CurrencyType>
    public gasOptionType: Subscription<GasOptionType>
    public fungibleAssetSourceType: Subscription<SourceType>
    public nonFungibleAssetSourceType: Subscription<SourceType>

    constructor(private storage: StorageObject<SettingsStorage>) {
        this.allowTestnet = createConstantSubscription(process.env.NODE_ENV === 'development')
        this.currencyType = this.storage.currencyType.subscription
        this.gasOptionType = this.storage.gasOptionType.subscription
        this.fungibleAssetSourceType = this.storage.fungibleAssetSourceType.subscription
        this.nonFungibleAssetSourceType = this.storage.nonFungibleAssetSourceType.subscription
    }

    async setDefaultCurrencyType(currencyType: CurrencyType) {
        await this.storage.currencyType.setValue(currencyType)
    }
}
