import { Composer, type Middleware, ProviderType } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { NoneWallet } from '../interceptors/None.js'
import { MaskWallet } from '../interceptors/MaskWallet.js'
import { WalletConnect } from '../interceptors/WalletConnect.js'
import { MetaMaskLike } from '../interceptors/MetaMaskLike.js'
import { Fortmatic } from '../interceptors/Fortmatic.js'
import { ContractWallet } from '../interceptors/ContractWallet.js'
import { Popups } from '../interceptors/Popups.js'
import { SmartPayAccountAPI, SmartPayBundlerAPI, SmartPayFunderAPI } from '../../../SmartPay/index.js'

const Account = new SmartPayAccountAPI()
const Bundler = new SmartPayBundlerAPI()
const Funder = new SmartPayFunderAPI()

export class Interceptor implements Middleware<ConnectionContext> {
    private composers: Partial<Record<ProviderType, Composer<ConnectionContext>>> = {
        [ProviderType.None]: Composer.from(new NoneWallet()),
        [ProviderType.MaskWallet]: Composer.from(
            new Popups(),
            new ContractWallet(ProviderType.MaskWallet, Account, Bundler, Funder),
            new MaskWallet(),
        ),
        [ProviderType.MetaMask]: Composer.from(new MetaMaskLike(ProviderType.MetaMask)),
        [ProviderType.WalletConnect]: Composer.from(new WalletConnect()),
        [ProviderType.Coin98]: Composer.from(new MetaMaskLike(ProviderType.Coin98)),
        [ProviderType.Fortmatic]: Composer.from(new Fortmatic()),
        [ProviderType.Opera]: Composer.from(new MetaMaskLike(ProviderType.Opera)),
        [ProviderType.Clover]: Composer.from(new MetaMaskLike(ProviderType.Clover)),
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const composer = this.composers[context.providerType]
        if (!composer || !context.writeable) {
            await next()
            return
        }

        await composer.dispatch(context, next)
    }
}
