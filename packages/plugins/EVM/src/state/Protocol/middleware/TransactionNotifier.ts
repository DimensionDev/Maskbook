import type { Transaction, TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import {
    EthereumMethodType,
    getPayloadSignature,
    getTransactionSignature,
    getTransactionState,
    isFinalState,
    isNextStateAvailable,
    ProviderType,
    TransactionState,
    TransactionStateType,
} from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { getTransactionByHash } from '../network'

class ProgressManager {
    private watchedProgress: Map<string, TransactionProgress> = new Map()

    public addProgress({ state, payload }: TransactionProgress) {
        const progressId = getPayloadSignature(payload)
        if (!progressId) return
        if (this.watchedProgress.has(progressId)) return

        this.watchedProgress.set(progressId, {
            state,
            payload,
        })
        this.updateProgressState(progressId, state)
    }

    public removeProgress(progressId: string) {
        this.watchedProgress.delete(progressId)
    }

    public updateProgressState(progressId: string, state: TransactionState) {
        const progress = this.watchedProgress.get(progressId)
        if (!progress) return

        progress.state = state
        // WalletMessages.events.transactionProgressUpdated.sendToAll(progress)

        // stop watch progress
        if (isFinalState(progress.state.type)) this.removeProgress(progressId)
    }

    public notifyProgress(progressId: string, state: TransactionState) {
        const progress = this.watchedProgress.get(progressId)
        if (!progress) return

        if (isNextStateAvailable(progress.state.type, state.type)) this.updateProgressState(progressId, state)
    }

    public notifyPayloadProgress(payload: JsonRpcPayload, state: TransactionState) {
        const progressId = getPayloadSignature(payload)
        if (!progressId) return

        this.notifyProgress(progressId, state)
    }

    public notifyTransactionProgress(transaction: Transaction, state: TransactionState) {
        const progressId = getTransactionSignature(transaction)
        if (!progressId) return

        this.notifyProgress(progressId, state)
    }
}

export interface TransactionProgress {
    state: TransactionState
    payload: JsonRpcPayload
}

/**
 * Keep notifying transaction status in progress.
 */
export class TransactionNotifier implements Middleware<Context> {
    private progressManager = new ProgressManager()

    async fn(context: Context, next: () => Promise<void>) {
        await next()

        try {
            switch (context.method) {
                case EthereumMethodType.ETH_SEND_TRANSACTION:
                    if (typeof context.result === 'string') {
                        this.progressManager.addProgress({
                            state: {
                                type:
                                    context.providerType === ProviderType.MaskWallet
                                        ? TransactionStateType.UNKNOWN
                                        : TransactionStateType.WAIT_FOR_CONFIRMING,
                            },
                            payload: context.request,
                        })
                    } else if (context.error) {
                        this.progressManager.notifyPayloadProgress(context.request, {
                            type: TransactionStateType.FAILED,
                            error: context.error,
                        })
                    }
                    break
                case EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH:
                    const transaction = context.result as Transaction | undefined
                    if (transaction) {
                        this.progressManager.notifyTransactionProgress(transaction, {
                            type: TransactionStateType.HASH,
                            hash: transaction.hash,
                        })
                    }
                    break
                case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
                    const receipt = context.result as TransactionReceipt | undefined
                    if (receipt) {
                        const state = getTransactionState(receipt)
                        const transaction = await getTransactionByHash(receipt.transactionHash)
                        this.progressManager.notifyTransactionProgress(transaction, state)
                    }
                    break
            }
        } catch {
            // allow to fail
        }
    }
}
