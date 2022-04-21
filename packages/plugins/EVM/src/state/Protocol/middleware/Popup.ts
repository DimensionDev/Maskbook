import { defer } from '@dimensiondev/kit'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { EthereumMethodType, getPayloadConfig, ProviderType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { SharedContextSettings } from '../../../settings'

export class Popup implements Middleware<Context> {
    private previousRequests: {
        context: Context
        resume: () => void
    }[] = []

    private isRiskPayload(payload: JsonRpcPayload) {
        return [
            EthereumMethodType.ETH_SIGN,
            EthereumMethodType.PERSONAL_SIGN,
            EthereumMethodType.ETH_SIGN_TYPED_DATA,
            EthereumMethodType.ETH_DECRYPT,
            EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
            EthereumMethodType.ETH_SEND_TRANSACTION,
            EthereumMethodType.ETH_SIGN_TRANSACTION,
        ].includes(payload.method as EthereumMethodType)
    }

    async fn(context: Context, next: () => Promise<void>) {
        const { hasNativeAPI, shiftUnconfirmedRequest, pushUnconfirmedRequest, openPopupWindow, closePopupWindow } =
            SharedContextSettings.value

        if (context.providerType !== ProviderType.MaskWallet || hasNativeAPI || !context.requestOptions?.popupsWindow) {
            await next()
            return
        }

        switch (context.method) {
            case EthereumMethodType.MASK_CONFIRM_TRANSACTION:
            case EthereumMethodType.MASK_REJECT_TRANSACTION:
                const payload = await shiftUnconfirmedRequest()
                const previousRequest = this.previousRequests.shift()

                if (!payload) {
                    context.abort(new Error('No unconfirmed request.'))
                    break
                }

                await closePopupWindow()

                if (context.method === EthereumMethodType.MASK_CONFIRM_TRANSACTION) {
                    if (previousRequest) {
                        previousRequest.resume()
                    } else {
                        const config = getPayloadConfig(payload)

                        if (!config) {
                            context.abort(new Error('Failed to read transaction config.'))
                            break
                        }

                        // re-send the previous request
                        await context.connection.sendTransaction(config, context.requestOptions)
                    }
                } else {
                    if (previousRequest) {
                        previousRequest.context.abort(new Error('The user rejected the request.'))
                        previousRequest.resume()
                    }
                }
                context.end()
                break
            default:
                if (!this.isRiskPayload(context.request)) break

                try {
                    await pushUnconfirmedRequest(context.request)
                    await openPopupWindow()

                    const [promise, resume] = defer<void>()

                    // for now, we only support one request per time.
                    this.previousRequests = [
                        {
                            context,
                            resume,
                        },
                    ]

                    // the context is holding until the user confirms or rejects it.
                    await promise
                } catch (error) {
                    context.abort(error, 'Failed to add request.')
                    break
                }
        }

        await next()
    }
}
