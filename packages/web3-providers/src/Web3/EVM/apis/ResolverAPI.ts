import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-evm'
import * as registryJs from '../../../Manager/registry.js'
import { ChainResolver } from '../../Base/apis/ChainResolver.js'
import { ExplorerResolver } from '../../Base/apis/ExplorerResolver.js'
import { ProviderResolver } from '../../Base/apis/ProviderResolver.js'
import { NetworkResolver } from '../../Base/apis/NetworkExplorer.js'

export const EVMChainResolver = new ChainResolver(() => {
    if (!registryJs.evm.state?.Network?.networks) return CHAIN_DESCRIPTORS
    return CHAIN_DESCRIPTORS.concat(registryJs.evm.state.Network.networks.getCurrentValue())
})
export const EVMExplorerResolver = new ExplorerResolver(() => {
    if (!registryJs.evm.state?.Network?.networks) return CHAIN_DESCRIPTORS
    return CHAIN_DESCRIPTORS.concat(registryJs.evm.state.Network.networks.getCurrentValue())
})
export const BlockScanExplorerResolver = new ExplorerResolver(() => [], {
    preferentialExplorer: 'https://blockscan.com',
    fungibleTokenPathname: '/token/:address',
})
export const EVMProviderResolver = new ProviderResolver(() => PROVIDER_DESCRIPTORS)
export const EVMNetworkResolver = new NetworkResolver(() => NETWORK_DESCRIPTORS)
