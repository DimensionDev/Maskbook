import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { HttpProvider, TransactionConfig } from 'web3-core'
import { createWeb3 } from './web3'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { EthereumMethodType, ProviderType } from '../../../web3/types'
import { commitNonce, resetNonce } from './nonce'
import { getWalletCached } from './wallet'

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
        console.table(payload)
        console.log(new Error().stack)
    }

    const web3 = await createWeb3()
    const provider = web3.currentProvider as HttpProvider | undefined
    const providerType = currentSelectedWalletProviderSettings.value

    // unable to create provider
    if (!provider) {
        callback(new Error('Failed to create provider.'))
        return
    }

    // illegal payload
    if (typeof payload.id === 'undefined') {
        callback(new Error('Unknown payload id.'))
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
                            params: payload.params.concat(''), // concat the password
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

                try {
                    const wallet = getWalletCached()
                    const _private_key_ = wallet?._private_key_
                    if (!wallet || !_private_key_) throw new Error('Unable to sign transaction.')

                    // send the signed transaction
                    const signedTransaction = await web3.eth.accounts.signTransaction(config, _private_key_)
                    provider.send(
                        {
                            ...payload,
                            method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                            params: [signedTransaction.rawTransaction],
                        },
                        (error, result) => {
                            callback(error, result)

                            // handle nonce
                            const error_ = (error ?? result?.error) as { message: string } | undefined
                            const message = error_?.message ?? ''
                            if (/\bnonce\b/im.test(message) && /\b(low|high)\b/im.test(message))
                                resetNonce(wallet.address)
                            else commitNonce(wallet.address)
                        },
                    )
                } catch (error) {
                    callback(error)
                }
            } else {
                provider.send(payload, callback)
            }
            break
        default:
            provider.send(payload, (error, response) => {
                console.log({
                    payload,
                    response,
                    error,
                })
                callback(error, response)
            })
            break
    }
}
