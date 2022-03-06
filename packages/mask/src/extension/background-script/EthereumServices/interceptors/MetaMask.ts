import type { JsonRpcPayload } from 'web3-core-helpers'
import { EthereumMethodType } from '@masknet/web3-shared-evm'
import { MetaMaskProvider } from '../providers/MetaMask'
import type { Context, Middleware } from '../types'

export class MetaMask implements Middleware<Context> {
    private provider = new MetaMaskProvider()

    private isPopupPayload(payload: JsonRpcPayload) {
        return [
            EthereumMethodType.WATCH_ASSET,
            EthereumMethodType.WATCH_ASSET_LEGACY,
            EthereumMethodType.ETH_SIGN,
            EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
            EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
            EthereumMethodType.ETH_SEND_TRANSACTION,
            EthereumMethodType.PERSONAL_SIGN,
            EthereumMethodType.ETH_DECRYPT,
            EthereumMethodType.ETH_SIGN_TYPED_DATA,
            EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
        ].includes(payload.method as EthereumMethodType)
    }

    async fn(context: Context, next: () => Promise<void>) {
        if (this.isPopupPayload(context.request)) await this.provider.ensureConnectedAndUnlocked()

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
