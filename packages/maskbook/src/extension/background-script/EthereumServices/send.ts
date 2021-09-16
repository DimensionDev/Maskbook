import { EthereumAddress } from 'wallet.ts'
import { first } from 'lodash-es'
import type { HttpProvider } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import {
    addGasMargin,
    ChainId,
    EthereumMethodType,
    EthereumRpcType,
    EthereumTransactionConfig,
    isEIP1159Supported,
    ProviderType,
} from '@masknet/web3-shared'
import type { IJsonRpcRequest } from '@walletconnect/types'
import { safeUnreachable } from '@dimensiondev/kit'
import * as MetaMask from './providers/MetaMask'
import { createWeb3 } from './web3'
import * as WalletConnect from './providers/WalletConnect'
import { getWallet } from '../../../plugins/Wallet/services'
import { commitNonce, getNonce, resetNonce } from './nonce'
import { getGasPrice } from './network'
import {
    currentAccountSettings,
    currentChainIdSettings,
    currentProviderSettings,
} from '../../../plugins/Wallet/settings'
import { debugModeSetting } from '../../../settings/settings'
import { Flags } from '../../../utils'
import { nativeAPI } from '../../../utils/native-rpc'
import { WalletRPC } from '../../../plugins/Wallet/messages'
import { getSendTransactionComputedPayload } from './rpc'

export interface SendOverrides {
    chainId?: ChainId
    account?: string
    providerType?: ProviderType
}

function parseGasPrice(price: string | undefined) {
    return Number.parseInt(price ?? '0x0', 16)
}

function isReadOnlyMethod(payload: JsonRpcPayload) {
    return [
        EthereumMethodType.ETH_GET_CODE,
        EthereumMethodType.ETH_GAS_PRICE,
        EthereumMethodType.ETH_BLOCK_NUMBER,
        EthereumMethodType.ETH_GET_BALANCE,
        EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
        EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
        EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
        EthereumMethodType.ETH_ESTIMATE_GAS,
        EthereumMethodType.ETH_CALL,
        EthereumMethodType.ETH_GET_LOGS,
    ].includes(payload.method as EthereumMethodType)
}

function getChainIdFromPayload(payload: JsonRpcPayload) {
    switch (payload.method) {
        // here are methods that contracts may emit
        case EthereumMethodType.ETH_CALL:
        case EthereumMethodType.ETH_ESTIMATE_GAS:
        case EthereumMethodType.ETH_SEND_TRANSACTION:
            const config = first(payload.params) as { chainId?: string } | undefined
            return typeof config?.chainId === 'string' ? Number.parseInt(config.chainId, 16) || undefined : undefined
        default:
            return undefined
    }
}

async function handleTransferTransaction(payload: JsonRpcPayload) {
    if (payload.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return
    const computedPayload = await getSendTransactionComputedPayload(payload)
    if (!computedPayload) return
    switch (computedPayload.type) {
        case EthereumRpcType.SEND_ETHER:
            if (computedPayload._tx.to) await WalletRPC.addAddress(computedPayload._tx.to)
            break
        case EthereumRpcType.CONTRACT_INTERACTION:
            if (['transfer', 'transferFrom'].includes(computedPayload.name ?? '') && computedPayload.parameters?.to)
                await WalletRPC.addAddress(computedPayload.parameters.to)
            break
    }
}

function handleRecentTransaction(account: string, payload: JsonRpcPayload, response: JsonRpcResponse | undefined) {
    const hash = response?.result as string | undefined
    if (typeof hash !== 'string') return
    if (!/^0x([\dA-Fa-f]{64})$/.test(hash)) return
    WalletRPC.addRecentTransaction(account, hash, payload)
}

async function handleNonce(account: string, error: Error | null, response: JsonRpcResponse | undefined) {
    const error_ = (error ?? response?.error) as { message: string } | undefined
    const message = error_?.message ?? ''
    if (!EthereumAddress.isValid(account)) return
    if (/\bnonce\b/im.test(message) && /\b(low|high)\b/im.test(message)) resetNonce(account)
    else commitNonce(account)
}

/**
 * This API is only used internally. Please use requestSend instead in order to share the same payload id globally.
 * @param payload
 * @param callback
 * @param sendOverrides
 */
export async function INTERNAL_send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    {
        chainId = currentChainIdSettings.value,
        account = currentAccountSettings.value,
        providerType = currentProviderSettings.value,
    }: SendOverrides = {},
) {
    if (process.env.NODE_ENV === 'development' && debugModeSetting.value) {
        console.table(payload)
        console.debug(new Error().stack)
    }

    const wallet = providerType === ProviderType.MaskWallet ? await getWallet(account) : null
    const web3 = await createWeb3({
        chainId: getChainIdFromPayload(payload) ?? chainId,
        privKeys: wallet?._private_key_ ? [wallet._private_key_] : [],
        providerType: isReadOnlyMethod(payload) ? ProviderType.MaskWallet : providerType,
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
            case ProviderType.MaskWallet:
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
        const [config] = payload.params as [EthereumTransactionConfig]

        // add nonce
        if (providerType === ProviderType.MaskWallet && config.from)
            config.nonce = await getNonce(config.from as string)

        // add gas margin
        if (config.gas && !Flags.v2_enabled) config.gas = `0x${addGasMargin(config.gas).toString(16)}`

        // pricing transaction
        const isGasPriceValid = parseGasPrice(config.gasPrice as string) > 0
        const isEIP1159Valid =
            parseGasPrice(config.maxFeePerGas as string) > 0 && parseGasPrice(config.maxPriorityFeePerGas as string) > 0

        if (Flags.EIP1159_enabled && isEIP1159Supported(chainId) && !isEIP1159Valid) {
            throw new Error('To be implemented.')
        } else if (!isGasPriceValid) {
            config.gasPrice = await getGasPrice()
        }

        // send the transaction
        switch (providerType) {
            case ProviderType.MaskWallet:
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
                        handleTransferTransaction(payload)
                        handleRecentTransaction(account, payload, response)
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
                    handleTransferTransaction(payload)
                    handleRecentTransaction(account, payload, response)
                })
                break
            case ProviderType.WalletConnect:
                const response = await WalletConnect.sendCustomRequest(payload as IJsonRpcRequest)
                callback(null, response)
                handleTransferTransaction(payload)
                handleRecentTransaction(account, payload, response)
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
    } catch (error: any) {
        callback(error)
    }
}

/**
 * This API redirects requests to the native app.
 * @param payload
 * @param callback
 * @param sendOverrides
 */
export async function INTERNAL_nativeSend(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    { account = currentAccountSettings.value }: SendOverrides = {},
) {
    try {
        const response = await nativeAPI?.api.send(payload)
        callback(null, response)
        if (payload.method === EthereumMethodType.ETH_SEND_TRANSACTION) {
            handleNonce(account, null, response)
            handleTransferTransaction(payload)
            handleRecentTransaction(account, payload, response)
        }
    } catch (error) {
        if (error instanceof Error) {
            callback(error, undefined)
            handleNonce(account, error, undefined)
        }
        console.error('internal native send error', error)
    }
}
