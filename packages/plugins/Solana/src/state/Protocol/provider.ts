import { ProviderType } from '@masknet/web3-shared-solana'
import type { BaseProvider } from './providers/Base'
import { Coin98Provider } from './providers/Coin98'
import { PhantomProvider } from './providers/Phantom'
import { SolanaProvider } from './providers/Solana'

export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.Phantom]: new PhantomProvider(),
    [ProviderType.Sollet]: new SolanaProvider(),
    [ProviderType.Coin98]: new Coin98Provider(),
}
