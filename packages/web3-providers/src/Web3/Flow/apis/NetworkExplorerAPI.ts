import { NETWORK_DESCRIPTORS, type ChainId, type NetworkType } from '@masknet/web3-shared-flow'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export class FlowNetworkResolverAPI extends NetworkResolverAPI_Base<ChainId, NetworkType> {
    constructor() {
        super(NETWORK_DESCRIPTORS)
    }
}
