import { EthereumMethodType, EthereumTransactionConfig } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import type { Context, Middleware } from '../types'

export class RecentTransaction implements Middleware<Context> {
    private replaceHash = ''

    async fn(context: Context, next: () => Promise<void>) {
        switch (context.method) {
            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                const [hash, config] = context.request.params as [string, EthereumTransactionConfig]
                this.replaceHash = hash
                context.requestArguments = {
                    method: EthereumMethodType.ETH_SEND_TRANSACTION,
                    params: [config],
                }
                break
        }

        await next()

        switch (context.method) {
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                if (!context.account || !context.config || typeof context.result !== 'string') return
                if (this.replaceHash)
                    await WalletRPC.replaceRecentTransaction(
                        context.chainId,
                        context.account,
                        this.replaceHash,
                        context.result,
                        context.config,
                    )
                else
                    await WalletRPC.addRecentTransaction(
                        context.chainId,
                        context.account,
                        context.result,
                        context.config,
                    )
                break
        }
    }
}
