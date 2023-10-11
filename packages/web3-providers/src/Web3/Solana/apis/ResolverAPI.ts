import {
    PROVIDER_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    CHAIN_DESCRIPTORS,
    type ChainId,
    type SchemaType,
    type NetworkType,
    type ProviderType,
} from '@masknet/web3-shared-solana'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

class SolanaChainResolverAPI extends ChainResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    protected readonly descriptors = CHAIN_DESCRIPTORS
}

class SolanaExplorerResolverAPI extends ExplorerResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    protected readonly descriptors = CHAIN_DESCRIPTORS
    protected readonly initial = undefined
}

class SolanaProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    protected readonly descriptors = PROVIDER_DESCRIPTORS
}

class SolanaNetworkResolverAPI extends NetworkResolverAPI_Base<ChainId, NetworkType> {
    protected readonly descriptors = NETWORK_DESCRIPTORS
}
export const SolanaChainResolver = new SolanaChainResolverAPI()
export const SolanaExplorerResolver = new SolanaExplorerResolverAPI()
export const SolanaProviderResolver = new SolanaProviderResolverAPI()
export const SolanaNetworkResolver = new SolanaNetworkResolverAPI()
