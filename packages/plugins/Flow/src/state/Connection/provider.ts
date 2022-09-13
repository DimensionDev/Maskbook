import { ProviderType } from '@masknet/web3-shared-flow'
import { BaseProvider } from './providers/Base.js'
import { BloctoProvider } from './providers/Blocto.js'
import { DapperProvider } from './providers/Dapper.js'
import { LedgerProvider } from './providers/Ledger.js'

export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.None]: new BaseProvider(),
    [ProviderType.Blocto]: new BloctoProvider(),
    [ProviderType.Dapper]: new DapperProvider(),
    [ProviderType.Ledger]: new LedgerProvider(),
}
