import type { WalletProvider } from '@masknet/web3-shared-base'
import type { Web3, ChainId, ProviderType, Web3Provider } from '@masknet/web3-shared-evm'

export interface EVM_Provider extends WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {}
