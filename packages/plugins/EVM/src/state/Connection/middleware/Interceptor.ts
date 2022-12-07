import { ProviderType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types.js'
import { NoneWallet } from '../interceptors/None.js'
import { MaskWallet } from '../interceptors/MaskWallet.js'
import { WalletConnect } from '../interceptors/WalletConnect.js'
import { MetaMask } from '../interceptors/MetaMask.js'
import { Fortmatic } from '../interceptors/Fortmatic.js'
import { SmartPayBundler } from '@masknet/web3-providers'
import { ContractWallet } from '../interceptors/ContractWallet.js'

export class Interceptor implements Middleware<Context> {
    private interceptors: Partial<Record<ProviderType, Array<Middleware<Context>>>> = {
        [ProviderType.None]: [new NoneWallet()],
        [ProviderType.MaskWallet]: [new ContractWallet(SmartPayBundler), new MaskWallet()],
        [ProviderType.MetaMask]: [new MetaMask()],
        [ProviderType.WalletConnect]: [new WalletConnect()],
        [ProviderType.Coin98]: [new MetaMask()],
        [ProviderType.WalletLink]: [new MetaMask()],
        [ProviderType.MathWallet]: [new MetaMask()],
        [ProviderType.Fortmatic]: [new Fortmatic()],
        [ProviderType.Opera]: [new MetaMask()],
        [ProviderType.Clover]: [new MetaMask()],
    }

    async fn(context: Context, next: () => Promise<void>) {
        const interceptors = this.interceptors[context.providerType]
        if (context.writeable && interceptors) {
            for (const [index, value] of interceptors.entries()) {
                await value.fn(context, index === interceptors.length - 1 ? next : () => Promise.resolve())
            }
        } else await next()
    }
}
