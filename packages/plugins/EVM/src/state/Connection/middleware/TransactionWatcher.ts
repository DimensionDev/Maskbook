import { EthereumMethodType } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import type { Context, Middleware } from '../types'

export class TransactionWatcher implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        await next()

        if (context.method === EthereumMethodType.ETH_SEND_TRANSACTION && context.error) {
            console.log('DEBUG: context error')
            console.log(context)
            Web3StateSettings.value.TransactionWatcher?.notifyError(context.error)
        }
    }
}
