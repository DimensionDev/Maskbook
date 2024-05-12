import { EthereumMethodType, PayloadEditor, type Middleware, type ProviderType } from '@masknet/web3-shared-evm'
import { ConnectionAPI } from '../apis/ConnectionAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

export class MetaMaskLike implements Middleware<ConnectionContext> {
    constructor(providerType: ProviderType) {
        this.Web3 = new ConnectionAPI({ providerType })
    }
    private Web3

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        // Evoke the unlock popup when metamask-like is locked before send transaction or sign message.
        if (PayloadEditor.fromPayload(context.request).risky) {
            await this.Web3.connect(context.requestOptions)
        }

        switch (context.request.method) {
            case EthereumMethodType.personal_sign:
                context.requestArguments = {
                    ...context.requestArguments,
                    params: [...context.requestArguments.params.slice(0, 2), ''],
                }
                break
            case EthereumMethodType.eth_sendTransaction:
                const currentChainId = await this.Web3.getChainId()
                if (currentChainId !== context.chainId) {
                    await this.Web3.connect({
                        chainId: context.chainId,
                    })
                }
                break
            default:
                break
        }
        await next()
    }
}
