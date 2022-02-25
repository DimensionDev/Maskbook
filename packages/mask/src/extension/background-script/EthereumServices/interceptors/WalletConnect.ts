import { EthereumMethodType } from '@masknet/web3-shared-evm'
import type { IJsonRpcRequest } from '@walletconnect/types'
import { WalletConnectProvider } from '../providers/WalletConnect'
import type { Context, Middleware } from '../types'

export class WalletConnect implements Middleware<Context> {
    private provider = new WalletConnectProvider()

    async fn(context: Context, next: () => Promise<void>) {
        switch (context.request.method) {
            case EthereumMethodType.PERSONAL_SIGN:
                try {
                    const [data, address] = context.request.params as [string, string]
                    context.write(await this.provider.signPersonalMessage(data, address, ''))
                } catch (error) {
                    context.abort(error, 'Failed to sign message.')
                }
                break
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                try {
                    const [address, data] = context.request.params as [string, string]
                    context.write(await this.provider.signTypedDataMessage(address, data))
                } catch (error) {
                    context.abort(error, 'Failed to sign message.')
                }
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                try {
                    const response = await this.provider.sendCustomRequest(context.request as IJsonRpcRequest)
                    if (typeof response.result !== 'string') throw new Error('Failed to send transaction.')
                    context.write(response.result)
                } catch (error) {
                    context.abort(error, 'Failed to send transaction')
                }
                break
            default:
                break
        }
        await next()
    }
}
