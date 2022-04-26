import type { StorageItem } from '@masknet/shared-base'
import type { RiskWarningState as Web3RiskWarningState } from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

interface ConfirmationBook {
    [key: string]: boolean
}

export class RiskWarningState implements Web3RiskWarningState {
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
