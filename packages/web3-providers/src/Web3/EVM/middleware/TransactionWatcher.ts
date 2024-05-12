import type { RecognizableError } from '@masknet/web3-shared-base'
import { EthereumMethodType, type Middleware } from '@masknet/web3-shared-evm'
import { evm } from '../../../Manager/registry.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

export class TransactionWatcher implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        await next()

        const failedToSendTransaction =
            context.error &&
            [
                EthereumMethodType.MASK_DEPLOY,
                EthereumMethodType.MASK_FUND,
                EthereumMethodType.eth_sendTransaction,
                EthereumMethodType.eth_sendUserOperation,
            ].includes(context.method)
        const failedToEstimateTransaction =
            (context.error as RecognizableError | null)?.isRecognized &&
            context.method === EthereumMethodType.eth_estimateGas

        if (failedToSendTransaction || failedToEstimateTransaction) {
            await evm.state?.TransactionWatcher?.notifyError(context.error!, context.request)
        }
    }
}
