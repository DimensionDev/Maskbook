import type { RecognizableError } from '@masknet/web3-shared-base'
import { EthereumMethodType, type Middleware } from '@masknet/web3-shared-evm'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

export class TransactionWatcher implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        await next()

        const failedToSendTransaction =
            context.error &&
            [
                EthereumMethodType.MASK_DEPLOY,
                EthereumMethodType.MASK_FUND,
                EthereumMethodType.ETH_SEND_TRANSACTION,
                EthereumMethodType.ETH_SEND_USER_OPERATION,
            ].includes(context.method)
        const failedToEstimateTransaction =
            (context.error as RecognizableError | null)?.isRecognized &&
            context.method === EthereumMethodType.ETH_ESTIMATE_GAS

        if (failedToSendTransaction || failedToEstimateTransaction) {
            await Web3StateRef.value.TransactionWatcher?.notifyError(context.error!, context.request)
        }
    }
}
