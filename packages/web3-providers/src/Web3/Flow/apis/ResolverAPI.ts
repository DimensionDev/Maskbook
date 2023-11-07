import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-flow'
import { ChainResolverAPI } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI } from '../../Base/apis/NetworkExplorerAPI.js'

export const FlowChainResolver = new ChainResolverAPI(() => CHAIN_DESCRIPTORS)
export const FlowExplorerResolver = new ExplorerResolverAPI_Base(() => CHAIN_DESCRIPTORS, {
    addressPathname: '/account/:address',
    transactionPathname: '/transaction/:id',
    fungibleTokenPathname: '/contract/:address',
    nonFungibleTokenPathname: '/contract/:address',
})
export const FlowProviderResolver = new ProviderResolverAPI(() => PROVIDER_DESCRIPTORS)
export const FlowNetworkResolver = new NetworkResolverAPI(() => NETWORK_DESCRIPTORS)
