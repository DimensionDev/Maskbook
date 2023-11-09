import { ProviderType, type ChainId, type Web3, type Web3Provider } from '@masknet/web3-shared-flow'
import { FlowNoneProvider } from './None.js'
import { FlowBloctoProvider } from './Blocto.js'
import { FlowDapperProvider } from './Dapper.js'
import { FlowLedgerProvider } from './Ledger.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface FlowWalletProvider extends WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {}

export const FlowWalletProviders: Record<ProviderType, FlowWalletProvider> = {
    [ProviderType.None]: new FlowNoneProvider(),
    [ProviderType.Blocto]: new FlowBloctoProvider(),
    [ProviderType.Dapper]: new FlowDapperProvider(),
    [ProviderType.Ledger]: new FlowLedgerProvider(),
}
