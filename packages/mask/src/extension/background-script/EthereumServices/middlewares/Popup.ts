import { EthereumMethodType, isRiskPayload, ProviderType } from '@masknet/web3-shared-evm'
import Services from '../../../service'
import type { Context, Middleware } from '../types'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { hasNativeAPI } from '../../../../../shared/native-rpc'

export class Popup implements Middleware<Context> {
    private previousRequests: {
        context: Context
        next: () => Promise<void>
    }[] = []

    async fn(context: Context, next: () => Promise<void>) {
        if (context.providerType !== ProviderType.MaskWallet || hasNativeAPI) {
            await next()
            return
        }

        switch (context.method) {
            case EthereumMethodType.MASK_CONFIRM_TRANSACTION:
            case EthereumMethodType.MASK_REJECT_TRANSACTION:
                // recover request from cache
                const previousRequest = this.previousRequests.shift()

                // recover payload from DB
                const payload = await WalletRPC.popUnconfirmedRequest()
                if (!payload) {
                    context.abort(new Error('No unconfirmed request.'))
                    break
                }

                await Services.Helper.removePopupWindow()

                if (context.method === EthereumMethodType.MASK_CONFIRM_TRANSACTION) {
                    if (previousRequest) {
                        await previousRequest.next()
                        context.end(previousRequest.context.error, previousRequest.context.result)
                    } else {
                        context.requestArguments = {
                            method: payload.method,
                            params: payload.params,
                        }
                    }
                } else {
                    if (previousRequest) {
                        previousRequest.context.abort(new Error('The user rejected the request.'))
                        await previousRequest.next()
                    }
                    context.write(undefined)
                }
                break
            default:
                if (!isRiskPayload(context.request)) break

                if (await WalletRPC.topUnconfirmedRequest()) {
                    context.abort(new Error('There is already a pending request, and please handle it first.'))
                    break
                }

                await WalletRPC.pushUnconfirmedRequest(context.request)

                // for now, we only support on request per time.
                this.previousRequests = [
                    {
                        context,
                        next,
                    },
                ]

                // the context is holding until the user confirms or rejects it.
                return
        }

        await next()
    }
}
