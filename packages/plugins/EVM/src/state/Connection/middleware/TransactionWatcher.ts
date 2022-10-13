import { EthereumMethodType } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings/index.js'
import type { Context, Middleware } from '../types.js'

const CHECKING_METHODS = [EthereumMethodType.ETH_SEND_TRANSACTION, EthereumMethodType.ETH_ESTIMATE_GAS]
export class TransactionWatcher implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        await next()

        if (CHECKING_METHODS.includes(context.method) && context.error) {
            Web3StateSettings.value.TransactionWatcher?.notifyError(context.error, context.request)
        }
    }
}
