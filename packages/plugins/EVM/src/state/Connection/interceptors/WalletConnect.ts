import { toHex } from 'web3-utils'
import { EthereumMethodType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'

export class WalletConnect implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        switch (context.request.method) {
            case EthereumMethodType.PERSONAL_SIGN:
                context.requestArguments = {
                    ...context.requestArguments,
                    params: [...context.requestArguments.params.slice(0, 2), ''],
                }
                break
            default:
                break
        }

        await next()

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                if (typeof context.result === 'number') {
                    context.result = toHex(context.result)
                }
                break
            default:
                break
        }
    }
}
