import { type StorageItem } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { AddressBookState } from '../../Base/state/AddressBook.js'
import type { Contact } from '@masknet/web3-shared-base'

export class EVMAddressBook extends AddressBookState {
    constructor(storage: StorageItem<Contact[]>) {
        super(isValidAddress, isSameAddress, storage)
    }
}
