import type { Subscription } from 'use-subscription'
import { createConstantSubscription, StorageObject } from '@masknet/shared-base'
import type { Plugin } from '../types'
import { Web3Plugin, CurrencyType } from '../web3-types'

export interface SettingsStorage {
    currencyType: CurrencyType
}

export class SettingsState implements Web3Plugin.ObjectCapabilities.SettingsState {
    protected storage: StorageObject<SettingsStorage> = null!

    public allowTestnet?: Subscription<boolean>
    public currencyType?: Subscription<CurrencyType>

    constructor(context: Plugin.Shared.SharedContext) {
        const { storage } = context.createKVStorage('memory', {
            currencyType: CurrencyType.USD,
        })
        this.storage = storage

        this.allowTestnet = createConstantSubscription(process.env.NODE_ENV === 'development')
        this.currencyType = this.storage.currencyType.subscription
    }
}
