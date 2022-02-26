import { ProviderType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { MaskWallet } from '../interceptors/MaskWallet'
import { MetaMask } from '../interceptors/MetaMask'

export class Interceptor implements Middleware<Context> {
    private interceptors: Partial<Record<ProviderType, Middleware<Context>>> = {
        [ProviderType.MaskWallet]: new MaskWallet(),
        [ProviderType.MetaMask]: new MetaMask(),
    }

    async fn(context: Context, next: () => Promise<void>) {
        this.interceptors[context.providerType]?.fn(context, next)
    }
}
