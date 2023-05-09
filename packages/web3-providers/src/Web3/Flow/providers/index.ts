import { ProviderType, type ChainId, type Web3, type Web3Provider } from '@masknet/web3-shared-flow'
import { BaseProvider as FlowBaseProvider } from './Base.js'
import { BloctoProvider } from './Blocto.js'
import { DapperProvider } from './Dapper.js'
import { LedgerProvider } from './Ledger.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface FlowProvider extends WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {}

export const FlowProviders: Record<ProviderType, FlowProvider> = {
    [ProviderType.None]: new FlowBaseProvider(),
    [ProviderType.Blocto]: new BloctoProvider(),
    [ProviderType.Dapper]: new DapperProvider(),
    [ProviderType.Ledger]: new LedgerProvider(),
}
