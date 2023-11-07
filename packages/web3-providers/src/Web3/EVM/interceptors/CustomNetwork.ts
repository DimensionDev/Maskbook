import { noop } from 'lodash-es'
import { isSameURL } from '@masknet/web3-shared-base'
import { ErrorEditor, isMaskOnlyMethodType, type Middleware } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { Web3Readonly } from '../apis/ConnectionReadonlyAPI.js'

class CustomNetworkAPI implements Middleware<ConnectionContext> {
    private get networks() {
        if (!Web3StateRef.value?.Network) throw new Error('The web3 state does not load yet.')
        return Web3StateRef.value.Network.networks?.getCurrentValue()
    }

    private get customNetwork() {
        if (!Web3StateRef.value?.Network) throw new Error('The web3 state does not load yet.')
        const network = Web3StateRef.value.Network.network?.getCurrentValue()
        return network?.isCustomized ? network : undefined
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const customNetwork = this.networks?.find((x) => x.isCustomized && isSameURL(x.rpcUrl, context.providerURL))
        if (!customNetwork || context.risky || !context.writeable || isMaskOnlyMethodType(context.method)) {
            await next()
            return
        }

        try {
            const response = await Web3Readonly.getWeb3Provider({
                chainId: context.chainId,
                account: context.account,
                providerURL:
                    context.providerURL ??
                    // only attach providerURL when chainId got exactly matched.
                    (this.customNetwork?.chainId === context.chainId ? this.customNetwork.rpcUrl : undefined),
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
export const CustomNetwork = new CustomNetworkAPI()
