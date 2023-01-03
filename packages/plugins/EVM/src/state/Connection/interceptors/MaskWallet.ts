import { toHex } from 'web3-utils'
import { EthereumMethodType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types.js'
import { SharedContextSettings } from '../../../settings/index.js'

export class MaskWallet implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        const { account, chainId } = SharedContextSettings.value

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(toHex(chainId.getCurrentValue()))
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                context.write([account])
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                const config = context.config

                if (!config?.from || !config?.to) {
                    context.abort(new Error('Invalid JSON payload.'))
                    break
                }
                break
            default:
                break
        }
        await next()
    }
}
