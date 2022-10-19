import { ProviderType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types.js'
import { NoneWallet } from '../interceptors/None.js'
import { MaskWallet } from '../interceptors/MaskWallet.js'
import { WalletConnect } from '../interceptors/WalletConnect.js'
import { MetaMask } from '../interceptors/MetaMask.js'
import { Fortmatic } from '../interceptors/Fortmatic.js'

export class Interceptor implements Middleware<Context> {
    private interceptors: Partial<Record<ProviderType, Middleware<Context>>> = {
        [ProviderType.None]: new NoneWallet(),
        [ProviderType.MaskWallet]: new MaskWallet(),
        [ProviderType.MetaMask]: new MetaMask(),
        [ProviderType.WalletConnect]: new WalletConnect(),
        [ProviderType.Coin98]: new MetaMask(),
        [ProviderType.WalletLink]: new MetaMask(),
        [ProviderType.MathWallet]: new MetaMask(),
        [ProviderType.Fortmatic]: new Fortmatic(),
    }

    async fn(context: Context, next: () => Promise<void>) {
        if (context.writeable) await this.interceptors[context.providerType]?.fn(context, next)
        else await next()
    }
}
