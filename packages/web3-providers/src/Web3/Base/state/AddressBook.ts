import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST, type StorageItem } from '@masknet/shared-base'
import type { Contact, AddressBookState as Web3AddressBookState } from '@masknet/web3-shared-base'

export class AddressBookState implements Web3AddressBookState {
    public storage: StorageItem<Contact[]> = null!
    public contacts?: Subscription<Contact[]>

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected options: {
            isValidAddress(a: string): boolean
            isSameAddress(a: string, b: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = this.context.createKVStorage('persistent', {}).createSubScope('AddressBookV2', {
            value: EMPTY_LIST,
        })
        this.storage = storage.value
        this.contacts = this.storage.subscription
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    async addContact({ address, name }: Contact) {
        if (!this.options.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)
        await this.storage.setValue(this.storage.value.concat({ name, address }))
    }
    async removeContact(address: string) {
        if (!this.options.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)
        await this.storage.setValue(this.storage.value.filter((x) => !this.options.isSameAddress(x.address, address)))
    }

    async renameContact({ address, name }: Contact) {
        if (!this.options.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)

        await this.storage.setValue(
            this.storage.value.map((x) => {
                if (this.options.isSameAddress(x.address, address)) {
                    return { address, name }
                }
                return x
            }),
        )
    }
}
