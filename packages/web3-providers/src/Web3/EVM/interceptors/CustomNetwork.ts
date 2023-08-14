import { noop } from 'lodash-es'
import { isSameURL } from '@masknet/web3-shared-base'
import { ErrorEditor, isMaskOnlyMethodType, type Middleware } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { ConnectionReadonlyAPI } from '../apis/ConnectionReadonlyAPI.js'

export class CustomNetwork implements Middleware<ConnectionContext> {
    private Web3 = new ConnectionReadonlyAPI()

    private get networks() {
        if (!Web3StateRef.value?.Network) throw new Error('The web3 state does not load yet.')
        return Web3StateRef.value.Network.networks?.getCurrentValue()
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const customNetwork = this.networks?.find((x) => x.isCustomized && isSameURL(x.rpcUrl, context.providerURL))
        if (!customNetwork || context.risky || !context.writeable || isMaskOnlyMethodType(context.method)) {
            await next()
            return
        }

        try {
            const response = await this.Web3.getWeb3Provider({
                chainId: context.chainId,
                account: context.account,
                providerURL: context.providerURL,
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
