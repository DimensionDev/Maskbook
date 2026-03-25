import { EthereumMethodType, type Middleware } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { toHex } from '@masknet/shared-base'

export class WalletConnect implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        switch (context.request.method) {
            case EthereumMethodType.personal_sign:
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
            case EthereumMethodType.eth_chainId:
                if (typeof context.result === 'number') {
                    context.result = toHex(context.result)
                }
                break
            default:
                break
        }
    }
}
