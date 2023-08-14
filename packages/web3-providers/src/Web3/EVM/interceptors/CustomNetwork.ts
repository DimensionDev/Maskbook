import { noop } from 'lodash-es'
import { ErrorEditor, type Middleware } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { ConnectionReadonlyAPI } from '../apis/ConnectionReadonlyAPI.js'

export class CustomNetwork implements Middleware<ConnectionContext> {
    private Web3 = new ConnectionReadonlyAPI()

    private get customNetwork() {
        if (!Web3StateRef.value?.Network) throw new Error('The web3 state does not load yet.')
        const network = Web3StateRef.value.Network.network?.getCurrentValue()
        return network?.isCustomized ? network : undefined
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (!this.customNetwork || context.risky || !context.writeable) {
            await next()
            return
        }

        try {
            const response = await this.Web3.getWeb3Provider({
                chainId: context.chainId,
                account: context.account,
                providerURL: context.providerURL ?? this.customNetwork?.rpcUrl,
            }).sendAsync(context.request, noop)

            const editor = ErrorEditor.from(null, response)

            if (editor.presence) {
                context.abort(editor.error)
            } else {
                context.write(response.result)
            }
        } catch (error) {
            context.abort(error)
        }

        await next()
    }
}
