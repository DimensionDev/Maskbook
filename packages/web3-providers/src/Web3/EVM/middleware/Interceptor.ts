import { Composer, type Middleware, ProviderType } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { NoneWallet } from '../interceptors/None.js'
import { MaskWallet } from '../interceptors/MaskWallet.js'
import { WalletConnect } from '../interceptors/WalletConnect.js'
import { MetaMaskLike } from '../interceptors/MetaMaskLike.js'
import { Fortmatic } from '../interceptors/Fortmatic.js'
import { ContractWallet } from '../interceptors/ContractWallet.js'
import { Popups } from '../interceptors/Popups.js'
import { CustomNetwork } from '../interceptors/CustomNetwork.js'
import * as SmartPay from /* webpackDefer: true */ '../../../SmartPay/index.js'
import type { WalletAPI } from '../../../entry-types.js'

export class Interceptor implements Middleware<ConnectionContext> {
    constructor(private signWithPersona: WalletAPI.IOContext['signWithPersona']) {
        this.composers = {
            [ProviderType.None]: Composer.from(new NoneWallet()),
            [ProviderType.MaskWallet]: Composer.from(
                new Popups(),
                CustomNetwork,
                new ContractWallet(
                    ProviderType.MaskWallet,
                    SmartPay.SmartPayAccount,
                    SmartPay.SmartPayBundler,
                    SmartPay.SmartPayFunder,
                    this.signWithPersona,
                ),
                new MaskWallet(),
            ),
            [ProviderType.MetaMask]: Composer.from(new MetaMaskLike(ProviderType.MetaMask)),
            [ProviderType.WalletConnect]: Composer.from(new WalletConnect()),
            [ProviderType.Coin98]: Composer.from(new MetaMaskLike(ProviderType.Coin98)),
            [ProviderType.Fortmatic]: Composer.from(new Fortmatic()),
            [ProviderType.Opera]: Composer.from(new MetaMaskLike(ProviderType.Opera)),
            [ProviderType.Clover]: Composer.from(new MetaMaskLike(ProviderType.Clover)),
        }
    }
    private composers: Partial<Record<ProviderType, Composer<ConnectionContext>>>

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const composer = this.composers[context.providerType]
        if (!composer || !context.writeable) {
            await next()
            return
        }

        await composer.dispatch(context, next)
    }
}
