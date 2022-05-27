import type { Subscription } from 'use-subscription'
import { createConstantSubscription, StorageObject } from '@masknet/shared-base'
import { CurrencyType, GasOptionType, SourceType, SettingsState as Web3SettingsState } from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

export interface SettingsStorage {
    currencyType: CurrencyType
    gasOptionType: GasOptionType
    fungibleAssetSourceType: SourceType
    nonFungibleAssetSourceType: SourceType
}

export class SettingsState implements Web3SettingsState {
    protected storage: StorageObject<SettingsStorage> = null!

    public allowTestnet?: Subscription<boolean>
    public currencyType?: Subscription<CurrencyType>
    public gasOptionType?: Subscription<GasOptionType>
    public fungibleAssetSourceType?: Subscription<SourceType>
    public nonFungibleAssetSourceType?: Subscription<SourceType>

    constructor(context: Plugin.Shared.SharedContext) {
        const { storage } = context.createKVStorage('memory', 'Settings', {}).createSubScope('Settings', {
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
}
