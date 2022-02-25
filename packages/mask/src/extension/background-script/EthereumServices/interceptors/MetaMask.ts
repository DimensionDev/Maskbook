import { EthereumMethodType, isRiskPayload } from '@masknet/web3-shared-evm'
import { MetaMaskProvider } from '../providers/MetaMask'
import type { Context, Middleware } from '../types'

export class MetaMask implements Middleware<Context> {
    private provider = new MetaMaskProvider()

    async fn(context: Context, next: () => Promise<void>) {
        if (isRiskPayload(context.request)) await this.provider.ensureConnectedAndUnlocked()

        switch (context.request.method) {
            case EthereumMethodType.PERSONAL_SIGN:
                context.requestArguments.params = [...context.requestArguments.params.slice(0, 2), '']
                break
            default:
                break
        }
        await next()
    }
}
