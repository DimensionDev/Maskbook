import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-evm'
import * as State from /* webpackDefer: true */ './Web3StateAPI.js'
import { ChainResolver } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolver } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI } from '../../Base/apis/NetworkExplorerAPI.js'

export const EVMChainResolver = new ChainResolver(() => {
    if (!State.Web3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
    return CHAIN_DESCRIPTORS.concat(State.Web3StateRef.value.Network.networks.getCurrentValue())
})
export const EVMExplorerResolver = new ExplorerResolver(() => {
    if (!State.Web3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
    return CHAIN_DESCRIPTORS.concat(State.Web3StateRef.value.Network.networks.getCurrentValue())
})
export const EVMProviderResolver = new ProviderResolverAPI(() => PROVIDER_DESCRIPTORS)
export const EVMNetworkResolver = new NetworkResolverAPI(() => NETWORK_DESCRIPTORS)
