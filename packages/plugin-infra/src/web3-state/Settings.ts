import type { Subscription } from 'use-subscription'
import { createConstantSubscription, StorageObject } from '@masknet/shared-base'
import { CurrencyType, SettingsState as Web3SettingsState } from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

export interface SettingsStorage {
    currencyType: CurrencyType
}

export class SettingsState implements Web3SettingsState {
    protected storage: StorageObject<SettingsStorage> = null!

    public allowTestnet?: Subscription<boolean>
    public currencyType?: Subscription<CurrencyType>

    constructor(context: Plugin.Shared.SharedContext) {
        const { storage } = context.createKVStorage('memory', 'Settings', {
            currencyType: CurrencyType.USD,
        })
        this.storage = storage

        this.allowTestnet = createConstantSubscription(process.env.NODE_ENV === 'development')
        this.currencyType = this.storage.currencyType.subscription
    }
}
