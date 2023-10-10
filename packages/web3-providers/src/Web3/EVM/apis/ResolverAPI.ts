import {
    PROVIDER_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    CHAIN_DESCRIPTORS,
    type ChainId,
    type SchemaType,
    type NetworkType,
    type ProviderType,
} from '@masknet/web3-shared-evm'
import { Web3StateRef } from './Web3StateAPI.js'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export class ChainResolverAPI extends ChainResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    protected get descriptors() {
        if (!Web3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
        return CHAIN_DESCRIPTORS.concat(Web3StateRef.value.Network.networks.getCurrentValue())
    }
}

export class ExplorerResolverAPI extends ExplorerResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    protected get descriptors() {
        if (!Web3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
        return CHAIN_DESCRIPTORS.concat(Web3StateRef.value.Network.networks.getCurrentValue())
    }
    protected readonly initial = undefined
}

export class ProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    protected readonly descriptors = PROVIDER_DESCRIPTORS
}

export class NetworkResolverAPI extends NetworkResolverAPI_Base<ChainId, NetworkType> {
    protected readonly descriptors = NETWORK_DESCRIPTORS
}
