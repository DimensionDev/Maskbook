import type { TransactionReceipt } from 'web3-core'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { EthereumMethodType, Transaction } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { getReceiptStatus } from '../utils'
import { Web3StateSettings } from '../../../settings'

export class RecentTransaction implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        const { Transaction } = Web3StateSettings.value
        let replacedHash
        switch (context.method) {
            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                try {
                    const [hash, config] = context.request.params as [string, Transaction]

                    // remember the hash of the replaced tx
                    replacedHash = hash
                    context.write(await context.connection.sendTransaction(config, context.requestOptions))
                } catch (error) {
                    context.abort(error)
                }
                break
        }

        await next()

        try {
            switch (context.method) {
                case EthereumMethodType.ETH_SEND_TRANSACTION:
                    console.log({ config: context.config })
                    if (!context.config || typeof context.result !== 'string') return
                    if (replacedHash)
                        await Transaction?.replaceTransaction?.(
                            context.chainId,
                            context.account,
                            replacedHash,
                            context.result,
                            context.config,
                        )
                    else
                        await Transaction?.addTransaction?.(
                            context.chainId,
                            context.account,
                            context.result,
                            context.config,
                        )
                    break
                case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
                    const receipt = context.result as TransactionReceipt | null
                    const status = getReceiptStatus(receipt)
                    if (receipt?.transactionHash && status !== TransactionStatusType.NOT_DEPEND) {
                        await Transaction?.updateTransaction?.(
                            context.chainId,
                            context.account,
                            receipt.transactionHash,
                            status,
                        )
                    }
                    break
            }
        } catch {
            // to record tx in the database, allow to fail silently
        }
    }
}
