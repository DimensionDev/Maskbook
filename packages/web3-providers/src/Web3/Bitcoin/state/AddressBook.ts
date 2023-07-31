import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isValidBitcoinAddress, formatBitcoinAddress } from '@masknet/web3-shared-bitcoin'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class AddressBook extends AddressBookState {
    constructor(protected override context: Plugin.Shared.SharedUIContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_BITCOIN,
            isValidAddress: isValidBitcoinAddress,
            isSameAddress,
            formatAddress: formatBitcoinAddress,
        })
    }
}
