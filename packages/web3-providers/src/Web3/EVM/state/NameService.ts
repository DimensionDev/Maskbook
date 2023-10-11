import { NetworkPluginID } from '@masknet/shared-base'
import { formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { NameServiceState } from '../../Base/state/NameService.js'
import { ENS } from '../../../ENS/index.js'
import { SpaceID } from '../../../SpaceID/index.js'
import type { WalletAPI, NameServiceAPI } from '../../../entry-types.js'
import { Lens } from '../../../Lens/index.js'

export class NameService extends NameServiceState {
    constructor(context: WalletAPI.IOContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            isValidName: (x) => x !== '0x',
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress: formatEthereumAddress,
        })
    }

    override createResolvers(domainOnly?: boolean) {
        if (domainOnly) return [ENS, SpaceID] as NameServiceAPI.Provider[]
        return [ENS, SpaceID, Lens] as NameServiceAPI.Provider[]
    }
}
