import { PROVIDER_DESCRIPTORS, NETWORK_DESCRIPTORS } from '@masknet/web3-shared-solana'
import { SolanaWeb3StateRef } from './Web3StateAPI.js'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export const SolanaChainResolver = new ChainResolverAPI_Base(SolanaWeb3StateRef)
export const SolanaExplorerResolver = new ExplorerResolverAPI_Base(SolanaWeb3StateRef)
export const SolanaProviderResolver = new ProviderResolverAPI_Base(PROVIDER_DESCRIPTORS)
export const SolanaNetworkResolver = new NetworkResolverAPI_Base(NETWORK_DESCRIPTORS)
