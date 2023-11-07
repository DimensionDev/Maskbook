import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-solana'
import { ChainResolverAPI } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI } from '../../Base/apis/NetworkExplorerAPI.js'

export const SolanaChainResolver = new ChainResolverAPI(() => CHAIN_DESCRIPTORS)
export const SolanaExplorerResolver = new ExplorerResolverAPI_Base(() => CHAIN_DESCRIPTORS)
export const SolanaProviderResolver = new ProviderResolverAPI(() => PROVIDER_DESCRIPTORS)
export const SolanaNetworkResolver = new NetworkResolverAPI(() => NETWORK_DESCRIPTORS)
