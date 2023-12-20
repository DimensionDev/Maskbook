import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, type StorageItem } from '@masknet/shared-base'
import type { RiskWarningState as Web3RiskWarningState } from '@masknet/web3-shared-base'

export abstract class RiskWarningState implements Web3RiskWarningState {
    public approved?: Subscription<boolean>

    constructor(
        private account: Subscription<string> | undefined,
        private formatAddress: (a: string) => string,
        private storage: StorageItem<Record<string, boolean>>,
    ) {
        if (this.account) {
            this.approved = mapSubscription(
                mergeSubscription(this.account, this.storage.subscription),
                ([account, storage]) => storage[this.formatAddress(account)],
            )
        }
    }

    async isApproved(address: string) {
        return Reflect.has(this.storage.value, this.formatAddress(address))
    }

    async approve(address: string, pluginID?: string | undefined) {
        await this.storage.setValue({
            ...this.storage.value,
            [this.formatAddress(address)]: true,
        })
    }

    async revoke(address: string, pluginID?: string | undefined) {
        await this.storage.setValue({
            ...this.storage.value,
            [this.formatAddress(address)]: false,
        })
    }
}
