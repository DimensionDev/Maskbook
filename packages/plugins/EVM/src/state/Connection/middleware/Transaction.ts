import type { TransactionReceipt } from 'web3-core'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { EthereumMethodType, Transaction } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { getReceiptStatus } from '../utils'
import { Web3StateSettings } from '../../../settings'

export class RecentTransaction implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        const { Transaction, TransactionWatcher, BalanceNotifier, BlockNumberNotifier } = Web3StateSettings.value
        const isSquashed = typeof context.result !== 'undefined'

        await next()

        try {
            switch (context.method) {
                case EthereumMethodType.ETH_SEND_TRANSACTION:
                    if (!context.config || typeof context.result !== 'string') return
                    await Transaction?.addTransaction?.(
                        context.chainId,
                        context.account,
                        context.result,
                        context.config,
                    )
                    await TransactionWatcher?.watchTransaction(context.chainId, context.result, context.config)
                    break
                case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
                    if (isSquashed) return

                    const receipt = context.result as TransactionReceipt | null
                    const status = getReceiptStatus(receipt)
                    if (!receipt?.transactionHash || status === TransactionStatusType.NOT_DEPEND) return

                    // update in house transaction state
                    await Transaction?.updateTransaction?.(
                        context.chainId,
                        context.account,
                        receipt.transactionHash,
                        status,
                    )

                    // update built-in notifier
                    BalanceNotifier?.emitter.emit('update', {
                        chainId: context.chainId,
                        account: receipt.from,
                    })
                    // it could be a contract address, but it doesn't matter
                    BalanceNotifier?.emitter.emit('update', {
                        chainId: context.chainId,
                        account: receipt.to,
                    })
                    BlockNumberNotifier?.emitter.emit('update', context.chainId)
                    break
                case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                    if (!context.config || typeof context.result !== 'string') return
                    const [hash] = context.request.params as [string, Transaction]
                    await Transaction?.replaceTransaction?.(
                        context.chainId,
                        context.account,
                        hash,
                        context.result,
                        context.config,
                    )
                    break
            }
        } catch {
            // to record tx in the database, allow to fail silently
        }
    }
}
