import type { WalletAPI } from '../../../entry-types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-solana'
import { NetworkState } from '../../Base/state/Network.js'

export class Network extends NetworkState<ChainId, SchemaType, NetworkType> {
    constructor(context: WalletAPI.IOContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
        })
    }
}
