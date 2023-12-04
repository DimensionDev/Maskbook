import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatAddress, isValidAddress } from '@masknet/web3-shared-solana'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class SolanaAddressBook extends AddressBookState {
    constructor() {
        super({
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
            isValidAddress,
            isSameAddress,
            formatAddress,
        })
    }
}
