import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-flow'
import { NetworkState } from '../../Base/state/Network.js'

export class FlowNetwork extends NetworkState<ChainId, SchemaType, NetworkType> {
    constructor() {
        super(NetworkPluginID.PLUGIN_FLOW)
    }
}
