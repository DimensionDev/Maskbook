import { Composer, type Middleware, ProviderType } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { NoneWallet } from '../interceptors/None.js'
import { MetaMaskLike } from '../interceptors/MetaMaskLike.js'
import type { WalletAPI } from '../../../entry-types.js'

export class Interceptor implements Middleware<ConnectionContext> {
    constructor(private signWithPersona: WalletAPI.SignWithPersona) {
        this.composers = {
            [ProviderType.None]: Composer.from(new NoneWallet()),
            [ProviderType.CustomEvent]: Composer.from(new MetaMaskLike(ProviderType.CustomEvent)),
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
