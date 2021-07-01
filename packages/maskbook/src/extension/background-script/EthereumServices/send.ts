import type { HttpProvider, TransactionConfig } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { addGasMargin, EthereumMethodType, ProviderType } from '@masknet/web3-shared'
import type { IJsonRpcRequest } from '@walletconnect/types'
import { safeUnreachable } from '@dimensiondev/kit'
import { createWeb3 } from './web3'
import * as WalletConnect from './providers/WalletConnect'
import { currentAccountSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'
import { addRecentTransaction, getWallet } from '../../../plugins/Wallet/services'
import { commitNonce, getNonce, resetNonce } from './nonce'
import { getGasPrice } from './network'
import { EthereumAddress } from 'wallet.ts'

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

    const account = currentAccountSettings.value
    const providerType = currentProviderSettings.value
    const wallet = providerType === ProviderType.Maskbook ? await getWallet() : null
    const web3 = createWeb3({
        privKeys: wallet?._private_key_ ? [wallet._private_key_] : [],
    })
    const provider = web3.currentProvider as HttpProvider | undefined

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

    async function personalSign() {
        const [data, address] = payload.params as [string, string]
        switch (providerType) {
            case ProviderType.Maskbook:
                callback(null, {
                    jsonrpc: '2.0',
                    id: payload.id as number,
                    result: await web3.eth.sign(data, address),
                })
                break
            case ProviderType.MetaMask:
                provider?.send(
                    {
                        ...payload,
                        params: [data, address, ''],
                    },
                    callback,
                )
                break
            case ProviderType.WalletConnect:
                callback(null, {
                    jsonrpc: '2.0',
                    id: payload.id as number,
                    result: await WalletConnect.signPersonalMessage(data, address, ''),
                })
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                safeUnreachable(providerType)
        }
    }

    async function sendTransaction() {
        const [config] = payload.params as [TransactionConfig]

        // add nonce
        if (providerType === ProviderType.Maskbook && config.from) config.nonce = await getNonce(config.from as string)

        // add gas price
        if (!config.gasPrice || !Number.parseInt((config.gasPrice as string) ?? '0x0', 16))
            config.gasPrice = await getGasPrice()

        // add gas margin
        if (config.gas) config.gas = `0x${addGasMargin(config.gas).toString(16)}`

        // send the transaction
        switch (providerType) {
            case ProviderType.Maskbook:
                const _private_key_ = wallet?._private_key_
                if (!wallet || !_private_key_) throw new Error('Unable to sign transaction.')

                // send the signed transaction
                const signedTransaction = await web3.eth.accounts.signTransaction(config, _private_key_)
                provider?.send(
                    {
                        ...payload,
                        method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                        params: [signedTransaction.rawTransaction],
                    },
                    (error, response) => {
                        callback(error, response)
                        handleNonce(account, error, response)
                        handleRecentTransaction(account, response)
                    },
                )
                break
            case ProviderType.MetaMask:
                provider?.send(payload, (error, response) => {
                    callback(error, response)
                    handleRecentTransaction(account, response)
                })
                break
            case ProviderType.WalletConnect:
                const response = await WalletConnect.sendCustomRequest(payload as IJsonRpcRequest)
                callback(null, response)
                handleRecentTransaction(account, response)
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                safeUnreachable(providerType)
        }
    }

    try {
        switch (payload.method) {
            case EthereumMethodType.PERSONAL_SIGN:
                await personalSign()
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                await sendTransaction()
                break
            default:
                provider.send(payload, callback)
                break
        }
    } catch (error) {
        callback(error)
    }
}

function handleRecentTransaction(account: string, response: JsonRpcResponse | undefined) {
    const hash = response?.result as string | undefined
    if (typeof hash !== 'string') return
    if (!/^0x([A-Fa-f0-9]{64})$/.test(hash)) return
    addRecentTransaction(account, hash)
}

async function handleNonce(account: string, error: Error | null, response: JsonRpcResponse | undefined) {
    const error_ = (error ?? response?.error) as { message: string } | undefined
    const message = error_?.message ?? ''
    if (!EthereumAddress.isValid(account)) return
    if (/\bnonce\b/im.test(message) && /\b(low|high)\b/im.test(message)) resetNonce(account)
    else commitNonce(account)
}
