import type { Subscription } from 'use-subscription'
import { type StorageItem } from '@masknet/shared-base'
import type { Contact, AddressBookState as Web3AddressBookState } from '@masknet/web3-shared-base'

export abstract class AddressBookState implements Web3AddressBookState {
    public contacts: Subscription<Contact[]>
    constructor(
        private isValidAddress: (a: string) => boolean,
        private isSameAddress: (a: string, b: string) => boolean,
        private storage: StorageItem<Contact[]>,
    ) {
        if (!storage.initialized) throw new Error('Storage not initialized')
        this.contacts = this.storage.subscription
    }

    async addContact({ address, name }: Contact) {
        if (!this.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)
        await this.storage.setValue(this.storage.value.concat({ name, address }))
    }
    async removeContact(address: string) {
        if (!this.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)
        await this.storage.setValue(this.storage.value.filter((x) => !this.isSameAddress(x.address, address)))
    }

    async renameContact({ address, name }: Contact) {
        if (!this.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)

        await this.storage.setValue(
            this.storage.value.map((x) => {
                if (this.isSameAddress(x.address, address)) {
                    return { address, name }
                }
                return x
            }),
        )
    }
}
