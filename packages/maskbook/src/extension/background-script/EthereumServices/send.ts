import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { HttpProvider, TransactionConfig } from 'web3-core'
import { createWeb3 } from './web3'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { EthereumMethodType, ProviderType } from '../../../web3/types'
import { commitNonce, resetNonce } from './nonce'

/**
 * This API is only used internally. Please use requestSend instead in order to share the same payload id globally.
 * @param payload
 * @param callback
 */
export async function INTERNAL_send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
) {
    if (process.env.NODE_ENV === 'development') {
        console.log('DEUBG: send')
        console.log(payload)
    }

    const web3 = await createWeb3()
    const provider = web3.currentProvider as HttpProvider | undefined
    const providerType = currentSelectedWalletProviderSettings.value

    // unable to create provider
    if (!provider) {
        callback(new Error('failed to create provider'))
        return
    }

    // illegal payload
    if (typeof payload.id === 'undefined') {
        callback(new Error('unknown payload id'))
        return
    }

    switch (payload.method) {
        case EthereumMethodType.PERSONAL_SIGN:
            const [data, address] = payload.params as [string, string]

            try {
                if (providerType === ProviderType.Maskbook) {
                    callback(null, {
                        jsonrpc: '2.0',
                        id: payload.id as number,
                        result: await web3.eth.sign(data, address),
                    })
                } else {
                    provider.send(
                        {
                            ...payload,
                            params: [...payload.params, ''],
                        },
                        callback,
                    )
                }
            } catch (e) {
                callback(e)
            }
            break
        case EthereumMethodType.ETH_SEND_TRANSACTION:
            if (providerType === ProviderType.Maskbook) {
                const [config] = payload.params as [TransactionConfig]

                // get the signer
                const signer = web3.eth.accounts.wallet[0]
                if (!signer) {
                    callback(new Error('failed to create signer.'))
                    return
                }

                // send signed transaction
                provider.send(
                    {
                        ...payload,
                        method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                        params: [(await signer.signTransaction(config)).rawTransaction],
                    },
                    (error, result) => {
                        callback(error, result)

                        // handle nonce
                        const message = error?.message || result?.error
                        if (/nonce\b.*\blow/im.test(message ?? '')) resetNonce(signer.address)
                        else commitNonce(signer.address)
                    },
                )
            } else {
                provider.send(payload, callback)
            }
            break
        default:
            provider.send(payload, callback)
            break
    }
}
