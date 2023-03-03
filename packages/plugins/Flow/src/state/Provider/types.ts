import type { WalletProvider } from '@masknet/web3-shared-base'
import type { ChainId, ProviderType, Web3, Web3Provider } from '@masknet/web3-shared-flow'

export interface FlowProvider extends WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {}
