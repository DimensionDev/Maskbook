import {
    PROVIDER_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    CHAIN_DESCRIPTORS,
    type ChainId,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-solana'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export const SolanaChainResolver = new ChainResolverAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
>(CHAIN_DESCRIPTORS)
export const SolanaExplorerResolver = new ExplorerResolverAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
>(CHAIN_DESCRIPTORS)
export const SolanaProviderResolver = new ProviderResolverAPI_Base(PROVIDER_DESCRIPTORS)
export const SolanaNetworkResolver = new NetworkResolverAPI_Base(NETWORK_DESCRIPTORS)
