import {
    PROVIDER_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    CHAIN_DESCRIPTORS,
    type ChainId,
    type SchemaType,
    type NetworkType,
    ProviderType,
} from '@masknet/web3-shared-solana'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export class SolanaChainResolverAPI extends ChainResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    constructor() {
        super(() => CHAIN_DESCRIPTORS)
    }
}

export class SolanaExplorerResolverAPI extends ExplorerResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    constructor() {
        super(() => CHAIN_DESCRIPTORS)
    }
}

export class SolanaProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    constructor() {
        super(() => PROVIDER_DESCRIPTORS)
    }
}

export class SolanaNetworkResolverAPI extends NetworkResolverAPI_Base<ChainId, NetworkType> {
    constructor() {
        super(() => NETWORK_DESCRIPTORS)
    }
}
