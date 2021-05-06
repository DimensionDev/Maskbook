import { first } from 'lodash-es'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { HttpProvider, TransactionConfig } from 'web3-core'
import { personalSign } from './network'
import { createWeb3 } from './web3'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { ProviderType } from '../../../web3/types'

/**
 * This API is only used internally. Please use requestSend instead.
 * @param payload
 * @param callback
 */
export async function UNSAFE_send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
) {
    if (process.env.NODE_ENV === 'development') {
        console.log('DEUBG: send')
        console.log(payload)
    }

    const web3 = await createWeb3()
    const provider = web3.currentProvider as HttpProvider | undefined
    const providerType = await currentSelectedWalletProviderSettings.readyPromise

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
        case 'personal_sign':
            const [data, address] = payload.params as [string, string]
            try {
                callback(null, {
                    jsonrpc: '2.0',
                    id: payload.id as number,
                    result: await personalSign(data, address, providerType === ProviderType.Maskbook ? undefined : ''),
                })
            } catch (e) {
                callback(e)
            }
            break
        case 'eth_sendTransaction':
            if (providerType === ProviderType.Maskbook) {
                const [config] = payload.params as [TransactionConfig]

                // get the signer
                const signer = first(web3.eth.accounts.wallet)
                if (!signer) {
                    callback(new Error('failed to create signer'))
                    return
                }

                // send signed transaction
                provider.send(
                    {
                        ...payload,
                        method: 'eth_sendRawTransaction',
                        params: [(await signer.signTransaction(config)).rawTransaction],
                    },
                    callback,
                )
            } else provider.send(payload, callback)
            break
        default:
            provider.send(payload, callback)
            break
    }
}
