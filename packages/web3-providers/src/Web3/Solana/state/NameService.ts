import type { NameServiceAPI, WalletAPI } from '../../../entry-types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { NameServiceState } from '../../Base/state/NameService.js'
import { BonfidaAPI } from '../../../Bonfida/index.js'

export class NameService extends NameServiceState {
    private Bonfida = new BonfidaAPI()

    constructor(context: WalletAPI.IOContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
            isValidName: (x) => isValidDomain(x),
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress,
        })
    }

    override createResolvers() {
        return [this.Bonfida] as NameServiceAPI.Provider[]
    }
}
