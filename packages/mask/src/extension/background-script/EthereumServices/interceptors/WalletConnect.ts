import { EthereumMethodType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'

export class WalletConnect implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        switch (context.request.method) {
            case EthereumMethodType.PERSONAL_SIGN:
                context.requestArguments.params = [...context.requestArguments.params.slice(0, 2), '']
                break
            case EthereumMethodType.ETH_REQUEST_ACCOUNTS:
                context.requestArguments.method = EthereumMethodType.ETH_ACCOUNTS
                break
            default:
                break
        }
        await next()
    }
}
