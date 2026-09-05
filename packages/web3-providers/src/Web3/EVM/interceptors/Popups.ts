import {
    ErrorEditor,
    type Middleware,
    EthereumMethodType,
    type MessageRequest,
    type MessageResponse,
} from '@masknet/web3-shared-evm'
import { MessageStateType, type TransferableMessage, isSameURL } from '@masknet/web3-shared-base'
import { evm } from '../../../Manager/registry.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { FireflyEmbeddedWalletProviderInstance } from '../providers/index.js'

export class Popups implements Middleware<ConnectionContext> {
    private get networks() {
        if (!evm.state?.Network) throw new Error('The web3 state does not load yet.')
        return evm.state.Network.networks?.getCurrentValue()
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (!context.risky || !context.writable) {
            await next()
            return
        }

        try {
            const fireflyProvider = FireflyEmbeddedWalletProviderInstance
            const currentChainId = fireflyProvider.subscription.chainId.getCurrentValue()

            if (context.method === EthereumMethodType.eth_sendTransaction && currentChainId !== context.chainId) {
                await fireflyProvider.switchChain(context.chainId)

                // if send risky requests to a custom network, the providerURL must be provided.
                const matchNetworkByProviderURL = this.networks?.find(
                    (x) => x.isCustomized && isSameURL(x.rpcUrl, context.providerURL),
                )

                // a built-in network will be matched by chainId
                const matchNetworkByChainId = this.networks?.find(
                    (x) => !x.isCustomized && x.chainId === context.chainId,
                )

                const network = matchNetworkByProviderURL ?? matchNetworkByChainId
                if (!network)
                    throw new Error(
                        'Failed to locate network. The providerURL must be given when sending risky requests to a custom network.',
                    )

                await evm.state?.Network?.switchNetwork(network.ID)
            }

            if (!evm.state?.Message) throw new Error('Failed to approve request.')

            const request: TransferableMessage<MessageRequest, MessageResponse> = {
                state: MessageStateType.NOT_DEPEND,
                origin: location.origin,
                request: {
                    arguments: context.requestArguments,
                    options: {
                        silent: context.silent,
                        providerType: context.providerType,
                        providerURL: context.providerURL,
                        gasOptionType: context.gasOptionType,
                    },
                },
            }
            const { request: updates, response } = await evm.state.Message.createRequestAndWaitForApproval(request)

            context.config = {
                ...context.config,
                ...updates.arguments.params[0],
            }

            const editor = ErrorEditor.from(null, response)

            if (editor.presence || !response) {
                context.abort(editor.error)
            }
            if (response && 'result' in response) {
                context.write(response.result)
            } else {
                context.write(undefined)
            }
        } catch (error) {
            context.abort(error)
        }

        await next()
    }
}
