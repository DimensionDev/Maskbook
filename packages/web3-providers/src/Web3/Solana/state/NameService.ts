import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { NameServiceState } from '../../Base/state/NameService.js'
import { BonfidaAPI } from '../../../Bonfida/index.js'
import type { NameServiceAPI } from '../../../entry-types.js'

export class NameService extends NameServiceState {
    private Bonfida = new BonfidaAPI()

    constructor(context: Plugin.Shared.SharedUIContext) {
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
