import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { HttpProvider, TransactionConfig } from 'web3-core'
import * as Maskbook from './providers/Maskbook'
import { sign } from './sign'
import { createWeb3 } from './provider'
import { signTransaction } from './signTransaction'
import {
    currentSelectedWalletProviderSettings,
    currentWalletConnectChainIdSettings,
} from '../../../plugins/Wallet/settings'
import { ProviderType } from '../../../web3/types'

export async function send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, payload?: JsonRpcResponse) => void,
) {
    if (process.env.NODE_ENV === 'development') {
        console.log('DEUBG: send')
        console.log(payload)
    }

    if (payload.method === 'personal_sign') {
        const [data, address] = payload.params as [string, string]
        try {
            const signed = await sign(data, address)
            if (!payload.id) throw new Error('unknown payload id')
            callback(null, {
                jsonrpc: '2.0',
                id: payload.id as number,
                result: signed,
            })
        } catch (e) {
            callback(e)
        }
        return
    }

    // unable to create provider
    const provider = (await createWeb3()).currentProvider as HttpProvider | undefined
    if (!provider) throw new Error('failed to create provider')

    switch (payload.method) {
        case 'eth_sendTransaction':
            if (currentSelectedWalletProviderSettings.value === ProviderType.Maskbook) {
                if (!payload.id) throw new Error('unknown payload id')
                const [config] = payload.params as [TransactionConfig]
                provider.send(
                    {
                        ...payload,
                        method: 'eth_sendRawTransaction',
                        params: [await signTransaction(config)],
                    },
                    callback,
                )
            } else provider.send(payload, callback)
            break
        case 'eth_sendRawTransaction':
            provider.send(payload, callback)
            break
        default:
            // hijack walletconnect RPC and redirect to mask RPC
            if (currentSelectedWalletProviderSettings.value === ProviderType.WalletConnect) {
                const maskProvider = Maskbook.createWeb3({
                    chainId: currentWalletConnectChainIdSettings.value,
                })
                ;(maskProvider.currentProvider as HttpProvider).send(payload, callback)
            } else provider.send(payload, callback)
            break
    }
}
