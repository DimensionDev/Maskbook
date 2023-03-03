import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, type StorageItem } from '@masknet/shared-base'
import type { RiskWarningState as Web3RiskWarningState } from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'

interface ConfirmationBook {
    [key: string]: boolean
}

export class RiskWarningState implements Web3RiskWarningState {
    public storage: StorageItem<ConfirmationBook> = null!
    public approved?: Subscription<boolean>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected subscriptions: {
            account?: Subscription<string>
        },
        protected options: {
            formatAddress(a: string): string
        },
    ) {
        const { storage } = this.context.createKVStorage('memory', {}).createSubScope('RiskWarning', {
            value: {},
        })

        this.storage = storage.value

        if (this.subscriptions.account) {
            this.approved = mapSubscription(
                mergeSubscription(this.subscriptions.account, this.storage.subscription),
                ([account, storage]) => storage[this.options.formatAddress(account)],
            )
        }
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    async isApproved(address: string) {
        return Reflect.has(this.storage.value, this.options.formatAddress(address))
    }

    async approve(address: string, pluginID?: string | undefined) {
        await this.storage.setValue({
            ...this.storage.value,
            [this.options.formatAddress(address)]: true,
        })
    }

    async revoke(address: string, pluginID?: string | undefined) {
        await this.storage.setValue({
            ...this.storage.value,
            [this.options.formatAddress(address)]: false,
        })
    }
}
