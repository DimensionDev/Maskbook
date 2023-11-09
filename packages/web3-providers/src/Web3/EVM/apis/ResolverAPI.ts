import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-evm'
import * as registryJs from '../../../Manager/registry.js'
import { ChainResolver } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolver } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI } from '../../Base/apis/NetworkExplorerAPI.js'

export const EVMChainResolver = new ChainResolver(() => {
    if (!registryJs.evm.state?.Network?.networks) return CHAIN_DESCRIPTORS
    return CHAIN_DESCRIPTORS.concat(registryJs.evm.state.Network.networks.getCurrentValue())
})
export const EVMExplorerResolver = new ExplorerResolver(() => {
    if (!registryJs.evm.state?.Network?.networks) return CHAIN_DESCRIPTORS
    return CHAIN_DESCRIPTORS.concat(registryJs.evm.state.Network.networks.getCurrentValue())
})
export const EVMProviderResolver = new ProviderResolverAPI(() => PROVIDER_DESCRIPTORS)
export const EVMNetworkResolver = new NetworkResolverAPI(() => NETWORK_DESCRIPTORS)
