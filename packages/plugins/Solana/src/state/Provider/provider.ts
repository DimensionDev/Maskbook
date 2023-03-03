import { ProviderType } from '@masknet/web3-shared-solana'
import { BaseProvider } from './providers/Base.js'
import { Coin98Provider } from './providers/Coin98.js'
import { PhantomProvider } from './providers/Phantom.js'
import { SolflareProvider } from './providers/SolflareProvider.js'
import { SolletProvider } from './providers/Sollet.js'

export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.None]: new BaseProvider(),
    [ProviderType.Phantom]: new PhantomProvider(),
    [ProviderType.Solflare]: new SolflareProvider(),
    [ProviderType.Sollet]: new SolletProvider(),
    [ProviderType.Coin98]: new Coin98Provider(),
}
