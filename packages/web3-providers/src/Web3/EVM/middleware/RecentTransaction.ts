import type { TransactionReceipt } from 'web3-core'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import {
    EthereumMethodType,
    type Transaction,
    type Middleware,
    getTransactionStatusType,
} from '@masknet/web3-shared-evm'
import { evm } from '../../../Manager/registry.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import * as UserTransaction from /* webpackDefer: true */ '../../../SmartPay/libs/UserTransaction.js'

export class RecentTransaction implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        // before sending a transaction, we measure the drafted time of such a transaction
        const draftedAt = new Date()

        await next()

        const { Transaction, BalanceNotifier, BlockNumberNotifier } = evm.state!

        try {
            switch (context.method) {
                case EthereumMethodType.eth_sendTransaction:
                    const tx = context.result as string
                    if (!tx || !context.config) return
                    const account = context.config.from ?? context.account
                    const chainId = context.config.chainId ?? context.chainId
                    await Transaction?.addTransaction?.(chainId, account, tx, { ...context.config, draftedAt })
                    break
                case EthereumMethodType.MASK_DEPLOY:
                case EthereumMethodType.MASK_FUND:
                    const tx_ = context.result as string
                    if (!tx_ || !context.config) return
                    await Transaction?.addTransaction?.(context.chainId, '', tx_, {
                        ...context.config,
                        from: '',
                        draftedAt,
                    })
                    break
                case EthereumMethodType.eth_sendUserOperation:
                    if (!context.userOperation || typeof context.result !== 'string') return
                    const transaction = UserTransaction.UserTransaction.toTransaction(
                        context.chainId,
                        context.userOperation,
                    )
                    await Transaction?.addTransaction?.(context.chainId, context.account, context.result, {
                        ...transaction,
                        draftedAt,
                    })
                    break
                case EthereumMethodType.eth_getTransactionReceipt:
                    const receipt = context.result as TransactionReceipt | null
                    const status = getTransactionStatusType(receipt)
                    if (!receipt?.transactionHash || status === TransactionStatusType.NOT_DEPEND) return

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
