import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-evm'
import * as State from /* webpackDefer: true */ './Web3StateAPI.js'
import { ChainResolverAPI } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI } from '../../Base/apis/NetworkExplorerAPI.js'

export const ChainResolver = new ChainResolverAPI(() => {
    if (!State.Web3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
    return CHAIN_DESCRIPTORS.concat(State.Web3StateRef.value.Network.networks.getCurrentValue())
})
export const ExplorerResolver = new ExplorerResolverAPI_Base(() => {
    if (!State.Web3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
    return CHAIN_DESCRIPTORS.concat(State.Web3StateRef.value.Network.networks.getCurrentValue())
})
export const ProviderResolver = new ProviderResolverAPI(() => PROVIDER_DESCRIPTORS)
export const NetworkResolver = new NetworkResolverAPI(() => NETWORK_DESCRIPTORS)
