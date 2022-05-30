import { ProviderType } from '@masknet/web3-shared-flow'
import type { BaseProvider } from './providers/Base'
import { BloctoProvider } from './providers/Blocto'
import { DapperProvider } from './providers/Dapper'
import { LedgerProvider } from './providers/Ledger'

export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.Blocto]: new BloctoProvider(),
    [ProviderType.Dapper]: new DapperProvider(),
    [ProviderType.Ledger]: new LedgerProvider(),
}
