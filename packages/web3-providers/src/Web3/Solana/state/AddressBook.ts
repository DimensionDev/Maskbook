import type { WalletAPI } from '../../../entry-types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatAddress, isValidAddress } from '@masknet/web3-shared-solana'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class AddressBook extends AddressBookState {
    constructor(context: WalletAPI.IOContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
            isValidAddress,
            isSameAddress,
            formatAddress,
        })
    }
}
