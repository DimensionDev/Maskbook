import { toHex } from 'web3-utils'
import { type ConnectionContext, EthereumMethodType, type Middleware } from '@masknet/web3-shared-evm'
import { SharedContextSettings } from '../../../settings/index.js'

export class MaskWallet implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (!context.writeable) {
            await next()
            return
        }

        const { account, chainId } = SharedContextSettings.value

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(toHex(chainId.getCurrentValue()))
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                context.write([account])
                break
            default:
                break
        }
        await next()
    }
}
