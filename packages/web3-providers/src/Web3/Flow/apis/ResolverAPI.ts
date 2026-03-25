import { NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-flow'
import { ChainResolver } from '../../Base/apis/ChainResolver.js'
import { ExplorerResolver } from '../../Base/apis/ExplorerResolver.js'
import { NetworkResolver } from '../../Base/apis/NetworkExplorer.js'

export const FlowChainResolver = new ChainResolver(() => CHAIN_DESCRIPTORS)
export const FlowExplorerResolver = new ExplorerResolver(() => CHAIN_DESCRIPTORS, {
    addressPathname: '/account/:address',
    transactionPathname: '/transaction/:id',
    fungibleTokenPathname: '/contract/:address',
    nonFungibleTokenPathname: '/contract/:address',
})
export const FlowNetworkResolver = new NetworkResolver(() => NETWORK_DESCRIPTORS)
