import { toHex } from 'web3-utils'
import { EthereumMethodType, createJsonRpcPayload } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types.js'
import { getError } from '../error.js'
import { SharedContextSettings } from '../../../settings/index.js'

export class MaskWallet implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        const { send, account, chainId } = SharedContextSettings.value

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(toHex(chainId.getCurrentValue()))
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                context.write([account])
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
            case EthereumMethodType.MASK_REPLACE_TRANSACTION: {
                const config = context.config

                if (!config?.from || !config?.to) {
                    context.abort(new Error('Invalid JSON payload.'))
                    break
                }

                const signed = await SharedContextSettings.value.signTransaction(config.from, config)
                if (!signed) {
                    context.abort(new Error('Failed to sign transaction.'))
                    break
                }

                const response = await send(
                    createJsonRpcPayload(0, {
                        method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                        params: [signed],
                    }),
                )

                if (!response.result) {
                    context.abort(new Error(response.error?.message ?? 'Failed to send transaction.'))
                    break
                }

                context.write(response.result as string)
                break
            }
            case EthereumMethodType.PERSONAL_SIGN: {
                const [data, account] = context.requestArguments.params as [string, string]
                try {
                    context.write(await SharedContextSettings.value.signPersonalMessage(data, account))
                } catch (error) {
                    context.abort(getError(error, null, 'Failed to sign message.'))
                }
                break
            }
            case EthereumMethodType.ETH_SIGN_TYPED_DATA: {
                const [address, dataToSign] = context.requestArguments.params as [string, string]
                try {
                    context.write(await SharedContextSettings.value.signTypedData(address, dataToSign))
                } catch (error) {
                    context.abort(getError(error, null, 'Failed to sign message.'))
                }
                break
            }
            default:
                break
        }
        await next()
    }
}
