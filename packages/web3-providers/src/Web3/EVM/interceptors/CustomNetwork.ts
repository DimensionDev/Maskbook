import { ProviderType, type Middleware } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { RequestReadonlyAPI } from '../apis/RequestReadonlyAPI.js'

export class CustomNetwork implements Middleware<ConnectionContext> {
    private Request = new RequestReadonlyAPI()

    private get Network() {
        if (!Web3StateRef.value.Network) throw new Error('The web3 state does not load yet.')
        return Web3StateRef.value.Network
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const network = this.Network.network?.getCurrentValue()

        if (context.providerType === ProviderType.MaskWallet && network?.isCustomized) {
            try {
                const result = await this.Request.request(context.requestArguments, {
                    providerURL: network.rpcUrl,
                })
                context.write(result)
            } catch (error) {
                context.abort(error)
            }
        }
        await next()
    }
}
