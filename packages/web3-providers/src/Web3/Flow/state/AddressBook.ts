import type { WalletAPI } from '../../../entry-types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isValidAddress, formatAddress } from '@masknet/web3-shared-flow'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class FlowAddressBook extends AddressBookState {
    constructor(protected override context: WalletAPI.IOContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_FLOW,
            isValidAddress,
            isSameAddress,
            formatAddress,
        })
    }
}
