import {
    PROVIDER_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    CHAIN_DESCRIPTORS,
    type ChainId,
    type SchemaType,
    type NetworkType,
    type ProviderType,
} from '@masknet/web3-shared-bitcoin'
import { BitcoinWeb3StateRef } from './Web3StateAPI.js'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export class BitcoinChainResolverAPI extends ChainResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    constructor() {
        super(() => {
            if (!BitcoinWeb3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
            return [...CHAIN_DESCRIPTORS, ...(BitcoinWeb3StateRef.value.Network.networks.getCurrentValue() ?? [])]
        })
    }
}

export class BitcoinExplorerResolverAPI extends ExplorerResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    constructor() {
        super(() => {
            if (!BitcoinWeb3StateRef.value?.Network?.networks) return CHAIN_DESCRIPTORS
            return [...CHAIN_DESCRIPTORS, ...(BitcoinWeb3StateRef.value.Network.networks.getCurrentValue() ?? [])]
        })
    }
}

export class BitcoinProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    constructor() {
        super(() => PROVIDER_DESCRIPTORS)
    }
}

export class BitcoinNetworkResolverAPI extends NetworkResolverAPI_Base<ChainId, NetworkType> {
    constructor() {
        super(() => NETWORK_DESCRIPTORS)
    }
}
