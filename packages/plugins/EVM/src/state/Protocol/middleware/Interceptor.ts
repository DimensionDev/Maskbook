import { ProviderType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { MaskWallet } from '../interceptors/MaskWallet'
import { WalletConnect } from '../interceptors/WalletConnect'
import { MetaMask } from '../interceptors/MetaMask'

export class Interceptor implements Middleware<Context> {
    private interceptors: Partial<Record<ProviderType, Middleware<Context>>> = {
        [ProviderType.MaskWallet]: new MaskWallet(),
        [ProviderType.MetaMask]: new MetaMask(),
        [ProviderType.WalletConnect]: new WalletConnect(),
        [ProviderType.Coin98]: new MetaMask(),
        [ProviderType.WalletLink]: new MetaMask(),
        [ProviderType.MathWallet]: new MetaMask(),
        [ProviderType.Fortmatic]: new MetaMask(),
    }

    async fn(context: Context, next: () => Promise<void>) {
        if (context.writeable) await this.interceptors[context.providerType]?.fn(context, next)
        else await next()
    }
}
