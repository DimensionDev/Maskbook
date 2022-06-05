import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { defer } from '@dimensiondev/kit'
import { ChainId, EthereumMethodType, getPayloadConfig, getPayloadId, getRPCConstants } from '@masknet/web3-shared-evm'
import { openPopupWindow, removePopupWindow } from '../../../../background/services/helper'
import { nativeAPI } from '../../../../shared/native-rpc'
import { WalletRPC } from '../messages'
import { isNil } from 'lodash-unified'

enum JSON_RPC_ERROR_CODE {
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = 32601,
    INVALID_PARAMS = -32602,
    INTERNAL_ERROR = -32603,
    SERVER_ERROR_RANGE_START = -32000,
    SERVER_ERROR_RANGE_END = -32099,
}

type Options = {
    account?: string
    chainId?: ChainId
    disableClose?: boolean
    popupsWindow?: boolean
}

const UNCONFIRMED_CALLBACK_MAP = new Map<number, (error: Error | null, response?: JsonRpcResponse) => void>()
const RISK_METHOD_LIST = [
    EthereumMethodType.ETH_SIGN,
    EthereumMethodType.PERSONAL_SIGN,
    EthereumMethodType.ETH_SIGN_TYPED_DATA,
    EthereumMethodType.ETH_DECRYPT,
    EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
    EthereumMethodType.ETH_SEND_TRANSACTION,
]

function isRiskMethod(method: EthereumMethodType) {
    return RISK_METHOD_LIST.includes(method)
}

let id = 0
const { RPC_WEIGHTS = [] } = getRPCConstants(ChainId.Mainnet)
const seed = Math.floor(Math.random() * RPC_WEIGHTS.length)
const providerPool = new Map<string, HttpProvider>()

function createProviderInstance(url: string) {
    const instance = providerPool.get(url)
    if (instance) return instance

    const newInstance = new Web3.providers.HttpProvider(url, {
        timeout: 30 * 1000, // ms
        // @ts-ignore
        clientConfig: {
            keepalive: true,
            keepaliveInterval: 1, // ms
        },
        reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: Number.MAX_SAFE_INTEGER,
            onTimeout: true,
        },
    })
    providerPool.set(url, newInstance)
    return newInstance
}

async function createProvider(chainId = ChainId.Mainnet) {
    const { RPC_URLS = [], RPC_WEIGHTS = [] } = getRPCConstants(chainId)
    const url = RPC_URLS[RPC_WEIGHTS[seed]]
    if (!url) throw new Error('Failed to create provider.')
    return createProviderInstance(url)
}

function getInternalError(error: unknown, response?: JsonRpcResponse | null, fallback?: string): Error {
    {
        const rpcError = error
        if (rpcError instanceof Error && rpcError.message) return rpcError
        if (rpcError && typeof (rpcError as Error).message === 'string') return new Error((rpcError as Error).message)
        if (rpcError && typeof rpcError === 'string') return new Error(rpcError)
    }

    {
        const responseError = response?.error as unknown
        if (responseError instanceof Error) return getError(responseError, null, fallback)
        if (responseError && typeof (responseError as Error).message === 'string')
            return getError(responseError, null, fallback)
        if (responseError && typeof responseError === 'string') return new Error(responseError)
    }
    if (fallback) return new Error(fallback)
    return new Error('Unknown Error.')
}

export function getError(error: unknown, response?: JsonRpcResponse | null, fallback?: string): Error {
    const internalError = getInternalError(error, response, fallback)
    const internalErrorMessage = (() => {
        const { code, message } = internalError as unknown as { code?: number; message: string }

        if (message.includes(`"code":${JSON_RPC_ERROR_CODE.INTERNAL_ERROR}`))
            return 'Transaction was failed due to an internal JSON-RPC server error.'
        if (message.includes('User denied message signature.')) return 'Signature canceled.'
        if (message.includes('User denied transaction signature.')) return 'Transaction was rejected!'
        if (message.includes('transaction underpriced')) return 'Transaction underpriced.'
        if (
            typeof code === 'number' &&
            (code === JSON_RPC_ERROR_CODE.INTERNAL_ERROR ||
                (code <= JSON_RPC_ERROR_CODE.SERVER_ERROR_RANGE_START &&
                    code >= JSON_RPC_ERROR_CODE.SERVER_ERROR_RANGE_END))
        ) {
            return 'Transaction was failed due to an internal JSON-RPC server error.'
        }
        return internalError.message
    })()

    return new Error(internalErrorMessage)
}

/**
 * Send to built-in RPC endpoints.
 */
export async function send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    options?: Options,
) {
    const provider = await createProvider(options?.chainId)

    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION:
        case EthereumMethodType.MASK_REPLACE_TRANSACTION:
            const computedPayload = getPayloadConfig(payload)
            if (!computedPayload?.from || !computedPayload.to || !options?.chainId) return

            const rawTransaction = await WalletRPC.signTransaction(computedPayload.from as string, {
                ...computedPayload,
                chainId: options.chainId,
            })
            if (!rawTransaction) break

            return provider.send(
                {
                    ...payload,
                    method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                    params: [rawTransaction],
                },
                callback,
            )
        default:
            return provider.send(payload, callback)
    }
}

/**
 * The entrance of all RPC requests to MaskWallet.
 */
export async function sendPayload(payload: JsonRpcPayload, options?: Options) {
    if (nativeAPI?.type === 'iOS') {
        return nativeAPI.api.send(payload) as unknown as JsonRpcResponse
    } else if (nativeAPI?.type === 'Android') {
        const response = await nativeAPI?.api.sendJsonString(JSON.stringify(payload))
        if (!response) throw new Error('Failed to send request to native APP.')
        return JSON.parse(response) as JsonRpcResponse
    } else {
        return new Promise<JsonRpcResponse>(async (resolve, reject) => {
            const callback = (error: Error | null, response?: JsonRpcResponse) => {
                if (!isNil(error) || !isNil(response?.error)) {
                    reject(getError(error, response))
                } else if (response) resolve(response)
            }

            id += 1

            const payload_ = {
                ...payload,
                id,
            }

            if (isRiskMethod(payload_.method as EthereumMethodType)) {
                await WalletRPC.pushUnconfirmedRequest(payload_)
                UNCONFIRMED_CALLBACK_MAP.set(payload_.id, callback)
                if (options?.popupsWindow) openPopupWindow()
                return
            }

            send(payload, callback, options)
        })
    }
}

export async function confirmRequest(payload: JsonRpcPayload, options?: Options) {
    const pid = getPayloadId(payload)
    if (!pid) return
    const [deferred, resolve, reject] = defer<JsonRpcResponse | undefined, Error>()
    send(
        payload,
        (error, response) => {
            UNCONFIRMED_CALLBACK_MAP.get(pid)?.(error, response)
            if (error) {
                reject(error)
                return
            }
            if (response?.error) {
                reject(new Error(`Failed to send transaction: ${response.error}`))
                return
            }
            WalletRPC.deleteUnconfirmedRequest(payload)
                .then(() => {
                    if (!options?.disableClose) removePopupWindow()
                })
                .finally(() => {
                    UNCONFIRMED_CALLBACK_MAP.delete(pid)
                })
            resolve(response)
        },
        options,
    )
    return deferred
}

export async function rejectRequest(payload: JsonRpcPayload) {
    const pid = getPayloadId(payload)
    if (!pid) return
    UNCONFIRMED_CALLBACK_MAP.get(pid)?.(new Error('User rejected transaction.'))
    await WalletRPC.deleteUnconfirmedRequest(payload)
    await removePopupWindow()
    UNCONFIRMED_CALLBACK_MAP.delete(pid)
}
