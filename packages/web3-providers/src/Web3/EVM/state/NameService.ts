import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { NameServiceState } from '../../Base/state/NameService.js'
import { ENS_API } from '../../../ENS/index.js'
import { SpaceID_API } from '../../../SpaceID/index.js'
import type { NameServiceAPI } from '../../../entry-types.js'

export class NameService extends NameServiceState {
    private ENS = new ENS_API()
    private SpaceID = new SpaceID_API()

    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            isValidName: (x) => x !== '0x',
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress: formatEthereumAddress,
        })
    }

    override createResolvers() {
        return [this.ENS, this.SpaceID] as NameServiceAPI.Provider[]
    }
}
