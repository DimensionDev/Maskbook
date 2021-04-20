import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { HttpProvider, TransactionConfig } from 'web3-core'
import { sign } from './sign'
import { createWeb3 } from './provider'
import { signTransaction } from './signTransaction'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { ProviderType } from '../../../web3/types'

export async function send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, payload?: JsonRpcResponse) => void,
) {
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

    // sign the transaction before send it to the provider
    if (
        payload.method === 'eth_sendTransaction' &&
        currentSelectedWalletProviderSettings.value !== ProviderType.WalletConnect
    ) {
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
        return
    }

    // bypass other methods
    provider.send(payload, callback)
}
