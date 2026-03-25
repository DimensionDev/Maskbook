import { NETWORK_DESCRIPTORS, CHAIN_DESCRIPTORS } from '@masknet/web3-shared-solana'
import { ChainResolver } from '../../Base/apis/ChainResolver.js'
import { ExplorerResolver } from '../../Base/apis/ExplorerResolver.js'
import { NetworkResolver } from '../../Base/apis/NetworkExplorer.js'

export const SolanaChainResolver = new ChainResolver(() => CHAIN_DESCRIPTORS)
export const SolanaExplorerResolver = new ExplorerResolver(() => CHAIN_DESCRIPTORS)
export const SolanaNetworkResolver = new NetworkResolver(() => NETWORK_DESCRIPTORS)
