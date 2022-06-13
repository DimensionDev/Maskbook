import { EthereumMethodType, isRiskMethod } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'

export class MetaMask implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        if (isRiskMethod(context.request.method as EthereumMethodType)) {
            await context.connection.connect()
        }
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
    }
}
