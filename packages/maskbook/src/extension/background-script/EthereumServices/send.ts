import { EthereumAddress } from 'wallet.ts'
import type { HttpProvider } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import {
    addGasMargin,
    ChainId,
    EthereumMethodType,
    EthereumTransactionConfig,
    isEIP1159Supported,
    ProviderType,
} from '@masknet/web3-shared'
import type { IJsonRpcRequest } from '@walletconnect/types'
import { safeUnreachable } from '@dimensiondev/kit'
import * as MetaMask from './providers/MetaMask'
import { createWeb3 } from './web3'
import * as WalletConnect from './providers/WalletConnect'
import { addRecentTransaction, getWallet } from '../../../plugins/Wallet/services'
import { commitNonce, getNonce, resetNonce } from './nonce'
import { getGasPrice } from './network'
import {
    currentAccountSettings,
    currentChainIdSettings,
    currentProviderSettings,
} from '../../../plugins/Wallet/settings'
import { debugModeSetting } from '../../../settings/settings'
import { Flags } from '../../../utils'
import { WalletRPC } from '../../../plugins/Wallet/messages'
import { PopupRoutes } from '../../popups'

export interface SendOverrides {
    chainId?: ChainId
    account?: string
    providerType?: ProviderType
    rpc?: string
    skipConfirmation?: boolean
}

function parseGasPrice(price: string | undefined) {
    return Number.parseInt(price ?? '0x0', 16)
}

function isRpcNeedToBeConfirmed(payload: JsonRpcPayload) {
    return [
        EthereumMethodType.ETH_SIGN,
        EthereumMethodType.PERSONAL_SIGN,
        EthereumMethodType.ETH_SIGN_TYPED_DATA,
        EthereumMethodType.ETH_DECRYPT,
        EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
        EthereumMethodType.ETH_SEND_TRANSACTION,
    ].includes(payload.method as EthereumMethodType)
}

/**
 * This API is only used internally. Please use requestSend instead in order to share the same payload id globally.
 * @param payload
 * @param callback
 * @param rpc
 */
export async function INTERNAL_send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    {
        chainId = currentChainIdSettings.value,
        account = currentAccountSettings.value,
        providerType = currentProviderSettings.value,
        rpc,
        skipConfirmation = false,
    }: SendOverrides = {},
) {
    if (process.env.NODE_ENV === 'development' && debugModeSetting.value) {
        console.table(payload)
        console.debug(new Error().stack)
    }

    // some rpc methods need to be confirmed by the user
    if (
        Flags.v2_enabled &&
        !skipConfirmation &&
        isRpcNeedToBeConfirmed(payload) &&
        providerType === ProviderType.Maskbook
    ) {
        try {
            await WalletRPC.pushUnconfirmedRequest(payload)
        } catch (error: any) {
            callback(error)
            return
        }

        window.open(
            browser.runtime.getURL(`popups.html${PopupRoutes.Wallet}`),
            '',
            'resizable,scrollbars,status,width=310,height=540',
        )
    }

    const wallet = providerType === ProviderType.Maskbook ? await getWallet() : null
    const web3 = await createWeb3({
        chainId,
        privKeys: wallet?._private_key_ ? [wallet._private_key_] : [],
        providerType,
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
                try {
                    await MetaMask.ensureConnectedAndUnlocked()
                } catch (error: any) {
                    callback(error)
                    break
                }
                provider?.send(
                    {
                        ...payload,
                        params: [data, address, ''],
                    },
                    callback,
                )
                break
            case ProviderType.WalletConnect:
                try {
                    const result = await WalletConnect.signPersonalMessage(data, address, '')
                    callback(null, {
                        jsonrpc: '2.0',
                        id: payload.id as number,
                        result,
                    })
                } catch (error) {
                    if (error instanceof Error) callback(error)
                }
                break
            case ProviderType.CustomNetwork:
                provider?.send(
                    {
                        ...payload,
                        params: [data, address, ''],
                    },
                    callback,
                )
                break
            default:
                safeUnreachable(providerType)
        }
    }

    async function sendTransaction() {
        const [config] = payload.params as [EthereumTransactionConfig]

        // add nonce
        if (providerType === ProviderType.Maskbook && config.from) config.nonce = await getNonce(config.from as string)

        // add gas margin
        if (config.gas) config.gas = `0x${addGasMargin(config.gas).toString(16)}`

        // pricing transaction
        const isGasPriceValid = parseGasPrice(config.gasPrice as string) > 0
        const isEIP1159Valid =
            parseGasPrice(config.maxFeePerGas as string) > 0 && parseGasPrice(config.maxPriorityFeePerGas as string) > 0

        if (Flags.EIP1159_enabled && isEIP1159Supported(chainId) && !isGasPriceValid && !isEIP1159Valid) {
            throw new Error('To be implemented.')
        } else {
            config.gasPrice = await getGasPrice()
        }

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
                try {
                    await MetaMask.ensureConnectedAndUnlocked()
                } catch (error: any) {
                    callback(error)
                    break
                }
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
                provider?.send(payload, (error, response) => {
                    callback(error, response)
                    handleRecentTransaction(account, response)
                })
                break
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
                if (rpc) {
                    fetch(rpc, {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    })
                        .catch((error: Error) => callback(error))
                        .then(async (res) => {
                            if (res) callback(null, (await res.json()) as JsonRpcResponse)
                        })
                } else {
                    provider.send(payload, callback)
                }
                break
        }
    } catch (error: any) {
        callback(error)
    }
}

function handleRecentTransaction(account: string, response: JsonRpcResponse | undefined) {
    const hash = response?.result as string | undefined
    if (typeof hash !== 'string') return
    if (!/^0x([\dA-Fa-f]{64})$/.test(hash)) return
    addRecentTransaction(account, hash)
}

async function handleNonce(account: string, error: Error | null, response: JsonRpcResponse | undefined) {
    const error_ = (error ?? response?.error) as { message: string } | undefined
    const message = error_?.message ?? ''
    if (!EthereumAddress.isValid(account)) return
    if (/\bnonce\b/im.test(message) && /\b(low|high)\b/im.test(message)) resetNonce(account)
    else commitNonce(account)
}
