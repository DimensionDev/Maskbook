import type { TransactionReceipt } from 'web3-core'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { EthereumMethodType, Transaction, UserTransaction } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types.js'
import { getReceiptStatus } from '../utils.js'
import { Web3StateSettings } from '../../../settings/index.js'
import type { FunderAPI } from '@masknet/web3-providers/types'

export class RecentTransaction implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        const { Transaction, TransactionWatcher, BalanceNotifier, BlockNumberNotifier } = Web3StateSettings.value
        const isSquashed = typeof context.result !== 'undefined'

        await next()

        try {
            switch (context.method) {
                case EthereumMethodType.ETH_SEND_TRANSACTION:
                case EthereumMethodType.MASK_DEPLOY:
                case EthereumMethodType.MASK_FUND:
                    const tx = (context.result as FunderAPI.Fund).message.tx
                    if (!context.config || !tx) return
                    await Transaction?.addTransaction?.(context.chainId, context.account, tx, context.config)
                    await TransactionWatcher?.watchTransaction(context.chainId, tx, context.config)
                    break
                case EthereumMethodType.ETH_SEND_USER_OPERATION:
                    if (!context.userOperation || typeof context.result !== 'string') return
                    const transaction = UserTransaction.toTransaction(context.chainId, context.userOperation)
                    await Transaction?.addTransaction?.(context.chainId, context.account, context.result, transaction)
                    await TransactionWatcher?.watchTransaction(context.chainId, context.result, transaction)
                    break
                case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
                    if (isSquashed) return

                    const receipt = context.result as TransactionReceipt | null
                    const status = getReceiptStatus(receipt)
                    if (!receipt?.transactionHash || status === TransactionStatusType.NOT_DEPEND) return

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
