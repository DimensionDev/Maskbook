import type { NameServiceAPI, WalletAPI } from '../../../entry-types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { NameServiceState } from '../../Base/state/NameService.js'
import { Bonfida } from '../../../Bonfida/index.js'

export class NameService extends NameServiceState {
    constructor(context: WalletAPI.IOContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
            isValidName: (x) => isValidDomain(x),
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress,
        })
    }

    override createResolvers(): NameServiceAPI.Provider[] {
        return [Bonfida]
    }
}
