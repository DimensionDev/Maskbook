import { EthereumMethodType } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings/index.js'
import type { Context, Middleware } from '../types.js'

const CHECKING_METHODS = [EthereumMethodType.ETH_SEND_TRANSACTION]
export class TransactionWatcher implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        await next()

        if (
            (context.method === EthereumMethodType.ETH_SEND_TRANSACTION && context.error) ||
            (context.error?.isRecognized && context.method === EthereumMethodType.ETH_ESTIMATE_GAS)
        ) {
            Web3StateSettings.value.TransactionWatcher?.notifyError(context.error, context.request)
        }
    }
}
