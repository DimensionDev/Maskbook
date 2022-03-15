import { ProviderType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { MaskWallet } from '../interceptors/MaskWallet'
import { WalletConnect } from '../interceptors/WalletConnect'
import { Injected } from '../interceptors/Injected'

export class Interceptor implements Middleware<Context> {
    private interceptors: Partial<Record<ProviderType, Middleware<Context>>> = {
        [ProviderType.MaskWallet]: new MaskWallet(),
        [ProviderType.MetaMask]: new Injected(),
        [ProviderType.WalletConnect]: new WalletConnect(),
        [ProviderType.Coin98]: new Injected(),
        [ProviderType.WalletLink]: new Injected(),
        [ProviderType.MathWallet]: new Injected(),
        [ProviderType.Fortmatic]: new Injected(),
    }

    async fn(context: Context, next: () => Promise<void>) {
        if (context.writeable) await this.interceptors[context.providerType]?.fn(context, next)
        else await next()
    }
}
