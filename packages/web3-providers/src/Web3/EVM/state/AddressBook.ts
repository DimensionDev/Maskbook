import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class EVMAddressBook extends AddressBookState {
    constructor() {
        super({
            pluginID: NetworkPluginID.PLUGIN_EVM,
            isValidAddress,
            isSameAddress,
            formatAddress: formatEthereumAddress,
        })
    }
}
