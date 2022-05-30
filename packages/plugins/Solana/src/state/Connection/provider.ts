import { ProviderType } from '@masknet/web3-shared-solana'
import type { BaseProvider } from './providers/Base'
import { Coin98Provider } from './providers/Coin98'
import { PhantomProvider } from './providers/Phantom'
import { SolflareProvider } from './providers/SolflareProvider'
import { SolletProvider } from './providers/Sollet'

export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.Phantom]: new PhantomProvider(),
    [ProviderType.Solflare]: new SolflareProvider(),
    [ProviderType.Sollet]: new SolletProvider(),
    [ProviderType.Coin98]: new Coin98Provider(),
}
