import { EthereumMethodType, EthereumTransactionConfig } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import type { Context, Middleware } from '../types'

export class RecentTransaction implements Middleware<Context> {
    async observe(context: Context, replacedHash: string | undefined) {}

    async fn(context: Context, next: () => Promise<void>) {
        let replacedHash

        switch (context.method) {
            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                const [hash, config] = context.request.params as [string, EthereumTransactionConfig]
                replacedHash = hash
                context.requestArguments = {
                    method: EthereumMethodType.ETH_SEND_TRANSACTION,
                    params: [config],
                }
                break
        }

        await next()

        // record tx in the database, allow to fail silently
        this.observe(context, replacedHash)
    }
}
