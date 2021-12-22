import { first } from 'lodash-unified'
import { EthereumAddress } from 'wallet.ts'
import { toHex } from 'web3-utils'
import type { HttpProvider } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { safeUnreachable } from '@dimensiondev/kit'
import {
    addGasMargin,
    ChainId,
    EthereumErrorType,
    EthereumMethodType,
    EthereumRpcType,
    EthereumTransactionConfig,
    isEIP1559Supported,
    isSameAddress,
    ProviderType,
    SendOverrides,
    isZeroAddress,
} from '@masknet/web3-shared-evm'
import type { IJsonRpcRequest } from '@walletconnect/types'
import * as MetaMask from './providers/MetaMask'
import * as Injected from './providers/Injected'
import * as WalletConnect from './providers/WalletConnect'
import * as Fortmatic from './providers/Fortmatic'
import { getWallet } from '../../../plugins/Wallet/services'
import { createWeb3 } from './web3'
import { commitNonce, getNonce, resetNonce } from './nonce'
import { getGasPrice } from './network'
import {
    currentAccountSettings,
    currentChainIdSettings,
    currentProviderSettings,
} from '../../../plugins/Wallet/settings'
import { debugModeSetting } from '../../../settings/settings'
import { Flags } from '../../../../shared'
import { nativeAPI } from '../../../utils/native-rpc'
import { WalletRPC } from '../../../plugins/Wallet/messages'
import { getSendTransactionComputedPayload } from './rpc'
import { getError, hasError } from './error'

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

function isSignableMethod(payload: JsonRpcPayload) {
    return [
        EthereumMethodType.ETH_SIGN,
        EthereumMethodType.PERSONAL_SIGN,
        EthereumMethodType.ETH_SIGN_TRANSACTION,
        EthereumMethodType.MASK_REPLACE_TRANSACTION,
        EthereumMethodType.ETH_SIGN_TYPED_DATA,
        EthereumMethodType.ETH_SEND_TRANSACTION,
    ].includes(payload.method as EthereumMethodType)
}

function getTo(computedPayload: UnboxPromise<ReturnType<typeof getSendTransactionComputedPayload>>) {
    if (!computedPayload) return ''
    switch (computedPayload.type) {
        case EthereumRpcType.SEND_ETHER:
            return (computedPayload._tx.to as string) ?? ''
        case EthereumRpcType.CONTRACT_INTERACTION:
            if (['transfer', 'transferFrom'].includes(computedPayload.name ?? ''))
                return (computedPayload.parameters?.to as string) ?? ''
    }
    return ''
}

function getPayloadChainId(payload: JsonRpcPayload) {
    switch (payload.method) {
        // here are methods that contracts may emit
        case EthereumMethodType.ETH_CALL:
        case EthereumMethodType.ETH_ESTIMATE_GAS:
        case EthereumMethodType.ETH_SEND_TRANSACTION:
            const config = first(payload.params) as { chainId?: string } | undefined
            return typeof config?.chainId === 'string' ? Number.parseInt(config.chainId, 16) || undefined : undefined
        default:
            return
    }
}

function getPayloadConfig(payload: JsonRpcPayload) {
    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION: {
            const [config] = payload.params as [EthereumTransactionConfig]
            return config
        }
        case EthereumMethodType.MASK_REPLACE_TRANSACTION: {
            const [, config] = payload.params as [string, EthereumTransactionConfig]
            return config
        }
        default:
            return
    }
}

function getPayloadHash(payload: JsonRpcPayload) {
    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION: {
            return ''
        }
        case EthereumMethodType.MASK_REPLACE_TRANSACTION: {
            const [hash] = payload.params as [string]
            return hash
        }
        default:
            return ''
    }
}

function getTransactionHash(response?: JsonRpcResponse) {
    if (!response) return ''
    const hash = response?.result as string | undefined
    if (typeof hash !== 'string') return ''
    if (!/^0x([\dA-Fa-f]{64})$/.test(hash)) return ''
    return hash
}

async function handleTransferTransaction(chainId: ChainId, payload: JsonRpcPayload) {
    if (payload.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return
    const computedPayload = await getSendTransactionComputedPayload(payload)
    if (!computedPayload) return

    const from = (computedPayload._tx.from as string) ?? ''
    const to = getTo(computedPayload)

    if (!isSameAddress(from, to) && !isZeroAddress(to)) await WalletRPC.addAddress(chainId, to)
}

function handleRecentTransaction(
    chainId: ChainId,
    account: string,
    payload: JsonRpcPayload,
    response: JsonRpcResponse | undefined,
) {
    const hash = getTransactionHash(response)
    if (!hash) return
    WalletRPC.watchTransaction(chainId, hash)
    WalletRPC.addRecentTransaction(chainId, account, hash, payload)
}

function handleReplaceRecentTransaction(
    chainId: ChainId,
    previousHash: string,
    account: string,
    payload: JsonRpcPayload,
    response: JsonRpcResponse | undefined,
) {
    const hash = getTransactionHash(response)
    if (!hash) return
    WalletRPC.watchTransaction(chainId, hash)
    WalletRPC.replaceRecentTransaction(chainId, account, previousHash, hash, payload)
}

async function handleNonce(
    chainId: ChainId,
    account: string,
    error: Error | null,
    response: JsonRpcResponse | undefined,
) {
    if (chainId !== currentChainIdSettings.value) return
    const error_ = (error ?? response?.error) as { message: string } | undefined
    const message = error_?.message ?? ''
    if (!EthereumAddress.isValid(account)) return
    // nonce too low
    // nonce too high
    // transaction too old
    if (/\bnonce|transaction\b/im.test(message) && /\b(low|high|old)\b/im.test(message)) resetNonce(account)
    else if (!error_) commitNonce(account)
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
    const chainIdFinally = getPayloadChainId(payload) ?? chainId
    const wallet = providerType === ProviderType.MaskWallet ? await getWallet(account) : null
    const privKey = isSignableMethod(payload) && wallet ? await WalletRPC.exportPrivateKey(wallet.address) : undefined
    const web3 = await createWeb3({
        chainId: chainIdFinally,
        privKeys: privKey ? [privKey] : [],
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
                try {
                    const signed = await web3.eth.sign(data, address)
                    callback(null, {
                        jsonrpc: '2.0',
                        id: payload.id as number,
                        result: signed,
                    })
                } catch (error) {
                    callback(getError(error, null, EthereumErrorType.ERR_SIGN_MESSAGE))
                }
                break
            case ProviderType.MetaMask:
                await MetaMask.ensureConnectedAndUnlocked()
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
                    callback(null, {
                        jsonrpc: '2.0',
                        id: payload.id as number,
                        result: await WalletConnect.signPersonalMessage(data, address, ''),
                    })
                } catch (error) {
                    callback(getError(error, null, EthereumErrorType.ERR_SIGN_MESSAGE))
                }
                break
            case ProviderType.Coin98:
            case ProviderType.WalletLink:
            case ProviderType.MathWallet:
                try {
                    callback(null, {
                        jsonrpc: '2.0',
                        id: payload.id as number,
                        result: await Injected.createProvider().request({
                            method: EthereumMethodType.PERSONAL_SIGN,
                            params: payload.params,
                        }),
                    })
                } catch (error) {
                    callback(getError(error, null, EthereumErrorType.ERR_SIGN_MESSAGE))
                }
                break
            case ProviderType.Fortmatic:
                try {
                    callback(null, {
                        jsonrpc: '2.0',
                        id: payload.id as number,
                        result: await Fortmatic.createProvider().request({
                            method: EthereumMethodType.PERSONAL_SIGN,
                            params: payload.params,
                        }),
                    })
                } catch (error) {
                    callback(getError(error, null, EthereumErrorType.ERR_SIGN_MESSAGE))
                }
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                safeUnreachable(providerType)
        }
    }

    async function sendTransaction() {
        const hash = getPayloadHash(payload)
        const config = getPayloadConfig(payload)

        if (!config) {
            callback(getError(null, null, EthereumErrorType.ERR_SEND_TRANSACTION))
            return
        }

        // add nonce
        if (providerType === ProviderType.MaskWallet && config.from && !config.nonce)
            config.nonce = await getNonce(config.from as string)

        // add gas margin
        if (config.gas) config.gas = addGasMargin(config.gas).toString()
        config.gas = toHex(config.gas ?? '0')

        // add chain id
        if (!config.chainId) config.chainId = chainIdFinally

        // pricing transaction
        const isGasPriceValid = parseGasPrice(config.gasPrice as string) > 0
        const isEIP1559Valid =
            parseGasPrice(config.maxFeePerGas as string) > 0 && parseGasPrice(config.maxPriorityFeePerGas as string) > 0

        if (Flags.EIP1559_enabled && isEIP1559Supported(chainIdFinally) && !isEIP1559Valid && !isGasPriceValid) {
            callback(new Error('Invalid EIP1159 payload.'))
            return
        }
        if (!isGasPriceValid) {
            config.gasPrice = await getGasPrice()
        }

        // if the transaction is eip-1559, need to remove gasPrice from the config
        if (Flags.EIP1559_enabled && isEIP1559Valid) {
            config.gasPrice = undefined
        } else {
            config.maxFeePerGas = undefined
            config.maxPriorityFeePerGas = undefined
        }

        // send the transaction
        switch (providerType) {
            case ProviderType.MaskWallet:
                if (!wallet?.storedKeyInfo || !privKey) {
                    callback(getError(null, null, EthereumErrorType.ERR_SIGN_TRANSACTION))
                    return
                }

                // send the signed transaction
                const signed = await web3.eth.accounts.signTransaction(config, privKey)
                if (!signed.rawTransaction) {
                    callback(getError(null, null, EthereumErrorType.ERR_SIGN_TRANSACTION))
                    return
                }

                provider?.send(
                    {
                        ...payload,
                        method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                        params: [signed.rawTransaction],
                    },
                    (error, response) => {
                        callback(
                            hasError(error, response)
                                ? getError(error, response, EthereumErrorType.ERR_SEND_TRANSACTION)
                                : null,
                            response,
                        )
                        switch (payload.method) {
                            case EthereumMethodType.ETH_SEND_TRANSACTION:
                                handleNonce(chainIdFinally, account, error, response)
                                handleTransferTransaction(chainIdFinally, payload)
                                handleRecentTransaction(chainIdFinally, account, payload, response)
                                break
                            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                                handleReplaceRecentTransaction(chainIdFinally, hash, account, payload, response)
                                break
                        }
                    },
                )
                break
            case ProviderType.MetaMask:
                try {
                    await MetaMask.ensureConnectedAndUnlocked()
                    provider?.send(payload, (error, response) => {
                        callback(
                            hasError(error, response)
                                ? getError(error, response, EthereumErrorType.ERR_SEND_TRANSACTION)
                                : null,
                            response,
                        )
                        handleTransferTransaction(chainIdFinally, payload)
                        handleRecentTransaction(chainIdFinally, account, payload, response)
                    })
                } catch (error) {
                    callback(getError(error, null, EthereumErrorType.ERR_SEND_TRANSACTION))
                    break
                }
                break
            case ProviderType.WalletConnect:
                try {
                    const response = await WalletConnect.sendCustomRequest(payload as IJsonRpcRequest)
                    callback(null, response)
                    handleTransferTransaction(chainIdFinally, payload)
                    handleRecentTransaction(chainIdFinally, account, payload, response)
                } catch (error) {
                    callback(getError(error, null, EthereumErrorType.ERR_SEND_TRANSACTION))
                }
                break
            case ProviderType.Coin98:
            case ProviderType.WalletLink:
            case ProviderType.MathWallet:
                await Injected.ensureConnectedAndUnlocked()
                Injected.createProvider().send(payload, (error, response) => {
                    callback(
                        hasError(error, response)
                            ? getError(error, response, EthereumErrorType.ERR_SEND_TRANSACTION)
                            : null,
                        response,
                    )
                    handleTransferTransaction(chainIdFinally, payload)
                    handleRecentTransaction(chainIdFinally, account, payload, response)
                })
                break
            case ProviderType.Fortmatic:
                Fortmatic.createProvider().send(payload, (error, response) => {
                    callback(
                        hasError(error, response)
                            ? getError(error, response, EthereumErrorType.ERR_SEND_TRANSACTION)
                            : null,
                        response,
                    )
                    handleTransferTransaction(chainIdFinally, payload)
                    handleRecentTransaction(chainIdFinally, account, payload, response)
                })
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                safeUnreachable(providerType)
        }
    }

    async function getTransactionReceipt() {
        const [hash] = payload.params as [string]

        try {
            callback(null, {
                id: payload.id,
                jsonrpc: payload.jsonrpc,
                // redirect receipt queries to tx watcher
                result: await WalletRPC.getReceipt(chainIdFinally, hash),
            } as JsonRpcResponse)
        } catch {
            callback(null, {
                id: payload.id,
                jsonrpc: payload.jsonrpc,
                result: null,
            } as JsonRpcResponse)
        }
    }

    try {
        switch (payload.method) {
            case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
                await getTransactionReceipt()
                break
            case EthereumMethodType.PERSONAL_SIGN:
                await personalSign()
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                await sendTransaction()
                break
            case EthereumMethodType.MASK_GET_TRANSACTION_RECEIPT:
                provider.send(
                    {
                        ...payload,
                        method: EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
                    },
                    callback,
                )
                break
            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                if (providerType !== ProviderType.MaskWallet)
                    throw new Error(`Cannot replace transaction for ${providerType}.`)
                await sendTransaction()
                break
            default:
                provider.send(payload, callback)
                break
        }
    } catch (error) {
        callback(getError(error, null, 'Failed to send request.'))
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
    { account = currentAccountSettings.value, chainId = currentChainIdSettings.value }: SendOverrides = {},
) {
    const chainIdFinally = getPayloadChainId(payload) ?? chainId
    const config = getPayloadConfig(payload)
    if (config && !config.chainId) config.chainId = chainIdFinally
    try {
        const response = await nativeAPI?.api.send(payload)
        callback(null, response)
        if (payload.method === EthereumMethodType.ETH_SEND_TRANSACTION) {
            handleNonce(chainIdFinally, account, null, response)
            handleTransferTransaction(chainIdFinally, payload)
            handleRecentTransaction(chainIdFinally, account, payload, response)
        }
    } catch (error) {
        if (!(error instanceof Error)) return
        callback(error, undefined)
        if (payload.method === EthereumMethodType.ETH_SEND_TRANSACTION) {
            handleNonce(chainIdFinally, account, error, undefined)
        }
    }
}
