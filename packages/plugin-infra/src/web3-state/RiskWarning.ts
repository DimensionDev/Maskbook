import type { StorageItem } from '@masknet/shared-base'
import type { Plugin } from '../types'
import type { Web3Plugin } from '../entry-web3'

interface ConfirmationBook {
    [key: string]: boolean
}

export class RiskWarningState implements Web3Plugin.ObjectCapabilities.RiskWarningState {
    protected storage: StorageItem<ConfirmationBook> = null!

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected options: {
            formatAddress(a: string): string
        },
    ) {
        const { storage } = this.context.createKVStorage('memory', {
            value: {},
        })

        this.storage = storage.value
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
