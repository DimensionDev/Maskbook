import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { ProviderType } from '../../../web3/types'
import { getChainId } from './chainState'
import { sign } from './sign'
import { getWallet } from '../../../plugins/Wallet/services'
import type { HttpProvider } from 'web3-core'
import { unreachable } from '../../../utils/utils'

export async function send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, payload?: JsonRpcResponse) => void,
) {
    const chainId = await getChainId()
    if (payload.method === 'personal_sign') {
        const [data, address] = payload.params as [string, string]
        try {
            const signed = await sign(data, address, chainId)
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

    const wallet = await getWallet()
    if (!wallet) throw new Error('cannot find any wallet')
    const provider = await (async () => {
        const providerType = currentSelectedWalletProviderSettings.value
        switch (providerType) {
            case ProviderType.Maskbook:
                if (!wallet._private_key_ || wallet._private_key_ === '0x')
                    throw new Error('cannot sign with given wallet')
                return Maskbook.createWeb3(chainId, [wallet._private_key_]).currentProvider as HttpProvider | undefined
            case ProviderType.MetaMask:
                return (await MetaMask.createWeb3()).currentProvider as HttpProvider | undefined
            case ProviderType.WalletConnect:
                return WalletConnect.createWeb3().currentProvider as HttpProvider | undefined
            default:
                unreachable(providerType)
        }
    })()
    if (provider) provider.send(payload, callback)
    else callback(new Error('cannot create provider'))
}
