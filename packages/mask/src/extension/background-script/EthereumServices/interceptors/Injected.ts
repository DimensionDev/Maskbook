import { EthereumMethodType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'

export class Injected implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        switch (context.request.method) {
            case EthereumMethodType.MASK_REQUEST_ACCOUNTS:
                context.requestArguments.method = EthereumMethodType.ETH_REQUEST_ACCOUNTS
                break
            case EthereumMethodType.MASK_DISMISS_ACCOUNTS:
                context.end()
                break
            case EthereumMethodType.PERSONAL_SIGN:
                context.requestArguments.params = [...context.requestArguments.params.slice(0, 2), '']
                break
            default:
                break
        }
        await next()
    }
}
