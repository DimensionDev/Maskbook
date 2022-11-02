import { EthereumMethodType } from '@masknet/web3-shared-evm'
import type { Middleware, Context } from '../types.js'

export class SCWallet implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        switch (context.request.method) {
            case EthereumMethodType.ETH_GET_BALANCE:
                context.write(0)
                break
            case EthereumMethodType.ETH_GET_TRANSACTION_COUNT:
                context.write(0)
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                break
            case EthereumMethodType.ETH_SEND_RAW_TRANSACTION:
                context.abort(new Error('The raw transaction is not supported by smart contract wallet.'))
                break
            default:
                break
        }

        await next()
    }
}
