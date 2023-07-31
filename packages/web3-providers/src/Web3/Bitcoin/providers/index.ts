import { ProviderType, type ChainId, type Web3, type Web3Provider } from '@masknet/web3-shared-bitcoin'
import { BaseProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface BitcoinProvider extends WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {}

export const BitcoinProviders: Record<ProviderType, BitcoinProvider> = {
    [ProviderType.None]: new BaseProvider(),
}
