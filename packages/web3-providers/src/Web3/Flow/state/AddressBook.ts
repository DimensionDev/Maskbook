import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isValidAddress, formatAddress } from '@masknet/web3-shared-flow'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class AddressBook extends AddressBookState {
    constructor(protected override context: Plugin.Shared.SharedUIContext) {
        super(context, {
            isValidAddress,
            isSameAddress,
            formatAddress,
        })
    }
}
