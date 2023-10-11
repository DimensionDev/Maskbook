import {
    PROVIDER_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    CHAIN_DESCRIPTORS,
    type ChainId,
    type SchemaType,
    type NetworkType,
    type ProviderType,
} from '@masknet/web3-shared-evm'
import * as State from /* webpackDefer: true */ './Web3StateAPI.js'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

class ChainResolverAPI extends ChainResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    constructor() {
        super(() => {
            if (!State.Web3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
            return [...CHAIN_DESCRIPTORS, ...(State.Web3StateRef.value.Network.networks.getCurrentValue() ?? [])]
        })
    }
}

class ExplorerResolverAPI extends ExplorerResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    constructor() {
        super(() => {
            if (!State.Web3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
            return [...CHAIN_DESCRIPTORS, ...(State.Web3StateRef.value.Network.networks.getCurrentValue() ?? [])]
        })
    }
}

class ProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    constructor() {
        super(() => PROVIDER_DESCRIPTORS)
    }
}

class NetworkResolverAPI extends NetworkResolverAPI_Base<ChainId, NetworkType> {
    constructor() {
        super(() => NETWORK_DESCRIPTORS)
    }
}

export const ChainResolver = new ChainResolverAPI()
export const ExplorerResolver = new ExplorerResolverAPI()
export const ProviderResolver = new ProviderResolverAPI()
export const NetworkResolver = new NetworkResolverAPI()
