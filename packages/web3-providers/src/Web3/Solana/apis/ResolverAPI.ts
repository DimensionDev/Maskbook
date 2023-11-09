import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-solana'
import { ChainResolver } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolver } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI } from '../../Base/apis/NetworkExplorerAPI.js'

export const SolanaChainResolver = new ChainResolver(() => CHAIN_DESCRIPTORS)
export const SolanaExplorerResolver = new ExplorerResolver(() => CHAIN_DESCRIPTORS)
export const SolanaProviderResolver = new ProviderResolverAPI(() => PROVIDER_DESCRIPTORS)
export const SolanaNetworkResolver = new NetworkResolverAPI(() => NETWORK_DESCRIPTORS)
