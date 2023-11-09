import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-flow'
import { ChainResolver } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolver } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI } from '../../Base/apis/NetworkExplorerAPI.js'

export const FlowChainResolver = new ChainResolver(() => CHAIN_DESCRIPTORS)
export const FlowExplorerResolver = new ExplorerResolver(() => CHAIN_DESCRIPTORS, {
    addressPathname: '/account/:address',
    transactionPathname: '/transaction/:id',
    fungibleTokenPathname: '/contract/:address',
    nonFungibleTokenPathname: '/contract/:address',
})
export const FlowProviderResolver = new ProviderResolverAPI(() => PROVIDER_DESCRIPTORS)
export const FlowNetworkResolver = new NetworkResolverAPI(() => NETWORK_DESCRIPTORS)
