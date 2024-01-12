import { noop } from 'lodash-es'
import { isSameURL } from '@masknet/web3-shared-base'
import { ErrorEditor, isMaskOnlyMethodType, type Middleware } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { evm } from '../../../Manager/registry.js'
import { EVMWeb3Readonly } from '../apis/ConnectionReadonlyAPI.js'

class CustomNetworkAPI implements Middleware<ConnectionContext> {
    private get networks() {
        if (!evm.state?.Network) throw new Error('The web3 state does not load yet.')
        return evm.state.Network.networks?.getCurrentValue()
    }

    private get customNetwork() {
        if (!evm.state?.Network) throw new Error('The web3 state does not load yet.')
        const network = evm.state.Network.network?.getCurrentValue()
        return network?.isCustomized ? network : undefined
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const customNetwork = this.networks?.find((x) => x.isCustomized && isSameURL(x.rpcUrl, context.providerURL))
        if (!customNetwork || context.risky || !context.writable || isMaskOnlyMethodType(context.method)) {
            await next()
            return
        }

        try {
            const response = await EVMWeb3Readonly.getWeb3Provider({
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
