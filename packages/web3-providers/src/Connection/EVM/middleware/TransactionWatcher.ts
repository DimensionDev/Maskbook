import type { RecognizableError } from '@masknet/web3-shared-base'
import { type ConnectionContext, EthereumMethodType, type Middleware } from '@masknet/web3-shared-evm'

export class TransactionWatcher implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        await next()

        const { TransactionWatcher } = context.state
        const recognizedError = context.error as RecognizableError | null

        if (
            (context.method === EthereumMethodType.ETH_SEND_TRANSACTION && recognizedError) ||
            (context.method === EthereumMethodType.ETH_ESTIMATE_GAS && recognizedError?.isRecognized)
        ) {
            await TransactionWatcher?.notifyError(recognizedError, context.request)
        }
    }
}
