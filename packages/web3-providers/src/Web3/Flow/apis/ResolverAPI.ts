import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-flow'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export const FlowChainResolver = new ChainResolverAPI_Base(CHAIN_DESCRIPTORS)
export const FlowExplorerResolver = new ExplorerResolverAPI_Base(CHAIN_DESCRIPTORS)
export const FlowProviderResolver = new ProviderResolverAPI_Base(PROVIDER_DESCRIPTORS)
export const FlowNetworkResolver = new NetworkResolverAPI_Base(NETWORK_DESCRIPTORS)
