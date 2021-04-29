import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { HttpProvider, TransactionConfig } from 'web3-core'
import { personalSign } from './network'
import { createWeb3 } from './web3'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { ProviderType } from '../../../web3/types'

export async function send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
) {
    if (process.env.NODE_ENV === 'development') {
        console.log('DEUBG: send')
        console.log(payload)
    }

    const web3 = await createWeb3()
    const provider = web3.currentProvider as HttpProvider | undefined

    // unable to create provider
    if (!provider) throw new Error('failed to create provider')

    switch (payload.method) {
        case 'personal_sign':
            const [data, address] = payload.params as [string, string]
            try {
                const signed = await personalSign(data, address)
                if (!payload.id) throw new Error('unknown payload id')
                callback(null, {
                    jsonrpc: '2.0',
                    id: payload.id as number,
                    result: signed,
                })
            } catch (e) {
                callback(e)
            }
            break
        case 'eth_sendTransaction':
            if (currentSelectedWalletProviderSettings.value === ProviderType.Maskbook) {
                if (!payload.id) throw new Error('unknown payload id')
                const [config] = payload.params as [TransactionConfig]
                provider.send(
                    {
                        ...payload,
                        method: 'eth_sendRawTransaction',
                        params: [(await web3.eth.accounts.wallet[0].signTransaction(config)).rawTransaction],
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
