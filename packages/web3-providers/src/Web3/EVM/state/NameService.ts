import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { ENS, SpaceID } from '@masknet/web3-providers'
import type { NameServiceAPI } from '@masknet/web3-providers/types'
import { NameServiceState } from '../../Base/state/NameService.js'

export class NameService extends NameServiceState {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            isValidName: (x) => x !== '0x',
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress: formatEthereumAddress,
        })
    }

    override createResolvers() {
        return [ENS, SpaceID] as NameServiceAPI.Provider[]
    }
}
