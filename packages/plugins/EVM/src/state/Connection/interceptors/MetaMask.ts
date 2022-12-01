import { EthereumMethodType, PayloadEditor } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types.js'

export class MetaMask implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        // Evoke the unlock popup when metamask-like is locked before send transaction or sign message.
        if (PayloadEditor.fromPayload(context.request).risky) {
            await context.connection.connect(context.requestOptions)
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
