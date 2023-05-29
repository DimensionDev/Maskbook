import { uniqBy } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { mapSubscription, mergeSubscription, type StorageItem } from '@masknet/shared-base'
import type { AddressBookState as Web3AddressBookState } from '@masknet/web3-shared-base'

export class AddressBookState<
    ChainId extends number,
    AddressBook extends Record<ChainId, string[]> = Record<ChainId, string[]>,
> implements Web3AddressBookState<ChainId>
{
    public storage: StorageItem<AddressBook> = null!
    public addressBook?: Subscription<string[]>

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected chainIds: ChainId[],
        protected subscriptions: {
            chainId?: Subscription<ChainId>
        },
        protected options: {
            isValidAddress(a: string): boolean
            isSameAddress(a: string, b: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = this.context.createKVStorage('persistent', {}).createSubScope('AddressBook', {
            value: Object.fromEntries(chainIds.map((x) => [x, []] as [ChainId, string[]])) as AddressBook,
        })
        this.storage = storage.value

        if (this.subscriptions.chainId) {
            this.addressBook = mapSubscription(
                mergeSubscription(this.subscriptions.chainId, this.storage.subscription),
                ([chainId, storage]) => storage[chainId],
            )
        }
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    async addAddress(chainId: ChainId, address: string) {
        if (!this.options.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)
        const all = this.storage.value
        await this.storage.setValue({
            ...all,
            [chainId]: uniqBy([...all[chainId], this.options.formatAddress(address)], (x) => x.toLowerCase()),
        })
    }
    async removeAddress(chainId: ChainId, address: string) {
        if (!this.options.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)
        const all = this.storage.value
        await this.storage.setValue({
            ...all,
            [chainId]: all[chainId].filter((x) => this.options.isSameAddress(x, address)),
        })
    }
}
