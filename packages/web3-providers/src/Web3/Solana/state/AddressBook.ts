import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatAddress, isValidAddress } from '@masknet/web3-shared-solana'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class AddressBook extends AddressBookState {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            isValidAddress,
            isSameAddress,
            formatAddress,
        })
    }
}
