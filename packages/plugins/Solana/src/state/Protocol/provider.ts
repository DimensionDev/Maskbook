import { ProviderType } from '@masknet/web3-shared-solana'
import type { BaseProvider } from './providers/Base'
import { PhantomProvider } from './providers/Phantom'
import { SolletProvider } from './providers/Sollet'

export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.Phantom]: new PhantomProvider(),
    [ProviderType.Sollet]: new SolletProvider(),
}
