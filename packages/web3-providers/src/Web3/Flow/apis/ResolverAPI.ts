import {
    PROVIDER_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    CHAIN_DESCRIPTORS,
    type ChainId,
    type SchemaType,
    type NetworkType,
    type ProviderType,
} from '@masknet/web3-shared-flow'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

class FlowChainResolverAPI extends ChainResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    protected readonly descriptors = CHAIN_DESCRIPTORS
}

class FlowExplorerResolverAPI extends ExplorerResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    protected readonly descriptors = CHAIN_DESCRIPTORS
    protected readonly initial = {
        addressPathname: '/account/:address',
        transactionPathname: '/transaction/:id',
        fungibleTokenPathname: '/contract/:address',
        nonFungibleTokenPathname: '/contract/:address',
    }
}

class FlowProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    protected readonly descriptors = PROVIDER_DESCRIPTORS
}

class FlowNetworkResolverAPI extends NetworkResolverAPI_Base<ChainId, NetworkType> {
    protected readonly descriptors = NETWORK_DESCRIPTORS
}

export const FlowChainResolver = new FlowChainResolverAPI()
export const FlowExplorerResolver = new FlowExplorerResolverAPI()
export const FlowProviderResolver = new FlowProviderResolverAPI()
export const FlowNetworkResolver = new FlowNetworkResolverAPI()
