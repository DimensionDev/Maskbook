import { Composer, type Middleware, ProviderType } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { NoneWallet } from '../interceptors/None.js'
import { MaskWallet } from '../interceptors/MaskWallet.js'
import { WalletConnect } from '../interceptors/WalletConnect.js'
import { MetaMaskLike } from '../interceptors/MetaMaskLike.js'
import { ContractWallet } from '../interceptors/ContractWallet.js'
import { Popups } from '../interceptors/Popups.js'
import { CustomNetwork } from '../interceptors/CustomNetwork.js'
import * as SmartPay from /* webpackDefer: true */ '../../../SmartPay/index.js'
import type { WalletAPI } from '../../../entry-types.js'

export class Interceptor implements Middleware<ConnectionContext> {
    constructor(private signWithPersona: WalletAPI.SignWithPersona) {
        this.composers = {
            [ProviderType.None]: Composer.from(new NoneWallet()),
            [ProviderType.BitGet]: Composer.from(new MetaMaskLike(ProviderType.BitGet)),
            [ProviderType.Browser]: null,
            [ProviderType.Coinbase]: null,
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
            [ProviderType.CustomEvent]: Composer.from(new MetaMaskLike(ProviderType.CustomEvent)),
            [ProviderType.MetaMask]: Composer.from(new MetaMaskLike(ProviderType.MetaMask)),
            [ProviderType.OKX]: Composer.from(new MetaMaskLike(ProviderType.OKX)),
            [ProviderType.WalletConnect]: Composer.from(new WalletConnect()),
            [ProviderType.Coin98]: Composer.from(new MetaMaskLike(ProviderType.Coin98)),
            [ProviderType.Opera]: Composer.from(new MetaMaskLike(ProviderType.Opera)),
            [ProviderType.Rabby]: Composer.from(new MetaMaskLike(ProviderType.Rabby)),
            [ProviderType.Rainbow]: Composer.from(new MetaMaskLike(ProviderType.Rainbow)),
            [ProviderType.Trust]: Composer.from(new MetaMaskLike(ProviderType.Trust)),
            [ProviderType.TokenPocket]: Composer.from(new MetaMaskLike(ProviderType.TokenPocket)),
            [ProviderType.OneKey]: Composer.from(new MetaMaskLike(ProviderType.OneKey)),
            [ProviderType.Clover]: Composer.from(new MetaMaskLike(ProviderType.Clover)),
            [ProviderType.Zerion]: Composer.from(new MetaMaskLike(ProviderType.Zerion)),
            [ProviderType.Crypto]: Composer.from(new MetaMaskLike(ProviderType.Crypto)),
        }
    }
    private composers: Record<ProviderType, Composer<ConnectionContext> | null>

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const composer = this.composers[context.providerType]
        if (!composer || !context.writable) {
            await next()
            return
        }

        await composer.dispatch(context, next)
    }
}
