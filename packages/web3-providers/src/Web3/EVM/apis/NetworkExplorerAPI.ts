import { NETWORK_DESCRIPTORS, type ChainId, type NetworkType } from '@masknet/web3-shared-evm'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export class NetworkResolverAPI extends NetworkResolverAPI_Base<ChainId, NetworkType> {
    constructor() {
        super(NETWORK_DESCRIPTORS)
    }
}
