import { ConnectionContext, Middleware, ProviderType } from '@masknet/web3-shared-evm'
import { SmartPayAccount, SmartPayBundler, SmartPayFunder } from '@masknet/web3-providers'
import { NoneWallet } from '../interceptors/None.js'
import { MaskWallet } from '../interceptors/MaskWallet.js'
import { WalletConnect } from '../interceptors/WalletConnect.js'
import { MetaMask } from '../interceptors/MetaMask.js'
import { Fortmatic } from '../interceptors/Fortmatic.js'
import { ContractWallet } from '../interceptors/ContractWallet.js'
import { Popups } from '../interceptors/Popups.js'

export class Interceptor implements Middleware<ConnectionContext> {
    private interceptors: Partial<Record<ProviderType, Array<Middleware<ConnectionContext>>>> = {
        [ProviderType.None]: [new NoneWallet()],
        [ProviderType.MaskWallet]: [
            new Popups(),
            new ContractWallet(ProviderType.MaskWallet, SmartPayAccount, SmartPayBundler, SmartPayFunder),
            new MaskWallet(),
        ],
        [ProviderType.MetaMask]: [new MetaMask()],
        [ProviderType.WalletConnect]: [new WalletConnect()],
        [ProviderType.Coin98]: [new MetaMask()],
        [ProviderType.WalletLink]: [new MetaMask()],
        [ProviderType.MathWallet]: [new MetaMask()],
        [ProviderType.Fortmatic]: [new Fortmatic()],
        [ProviderType.Opera]: [new MetaMask()],
        [ProviderType.Clover]: [new MetaMask()],
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const interceptors = this.interceptors[context.providerType]
        if (!interceptors?.length || !context.writeable) {
            await next()
            return
        }
        for (const middleware of interceptors.values()) {
            await middleware.fn(context, () => Promise.resolve())
            if (!context.writeable) break
        }
    }
}
