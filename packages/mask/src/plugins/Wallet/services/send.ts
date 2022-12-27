import { isNil } from 'lodash-es'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { defer } from '@masknet/kit'
import { SmartPayAccount, Web3 } from '@masknet/web3-providers'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import {
    ChainId,
    createJsonRpcPayload,
    createJsonRpcResponse,
    ErrorEditor,
    EthereumMethodType,
    PayloadEditor,
} from '@masknet/web3-shared-evm'
import { WalletRPC } from '../messages.js'
import { openPopupWindow, removePopupWindow } from '../../../../background/services/helper/index.js'
import { generateSignResult } from '../../../../background/services/identity/index.js'

interface Options {
    account?: string
    chainId?: ChainId
    owner?: string
    identifier?: ECKeyIdentifier
    disableClose?: boolean
    popupsWindow?: boolean
}

function getSigner(options: Options) {
    const { owner, identifier } = options
    if (!owner) throw new Error('Failed to sign transaction.')

    return async (message: string) => {
        if (identifier) {
            const { signature } = await generateSignResult('message', identifier, message)
            return signature
        }
        return WalletRPC.signPersonalMessage(message, owner)
    }
}

/**
 * Send to built-in RPC endpoints.
 */
async function internalSend(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    options?: Options,
): Promise<void> {
    const chainId = options?.chainId ?? ChainId.Mainnet
    const provider = Web3.createProvider(chainId)

    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION:
        case EthereumMethodType.MASK_REPLACE_TRANSACTION: {
            const config = PayloadEditor.fromPayload(payload).signableConfig
            if (!config?.from || !config.to) return

            if (options?.owner) {
                const hash = await SmartPayAccount.sendTransaction(chainId, options.owner, config, getSigner(options))
                callback(null, createJsonRpcResponse(payload.id as number, hash))
            } else {
                const signed = await WalletRPC.signTransaction(config.from as string, {
                    chainId,
                    ...config,
                })
                await provider.send(
                    createJsonRpcPayload(payload.id as number, {
                        method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                        params: [signed],
                    }),
                    callback,
                )
            }

            break
        }
        case EthereumMethodType.ETH_SIGN_TYPED_DATA: {
            const [address, dataToSign] = payload.params as [string, string]

            if (options?.owner && options.identifier) {
                const { signature } = await generateSignResult('typedData', options.identifier, dataToSign)
                callback(null, createJsonRpcResponse(payload.id as number, signature))
            } else {
                try {
                    callback(
                        null,
                        createJsonRpcResponse(payload.id as number, await WalletRPC.signTypedData(address, dataToSign)),
                    )
                } catch (error) {
                    callback(ErrorEditor.from(error, null, 'Failed to sign message.').error)
                }
            }
            break
        }
        case EthereumMethodType.ETH_SIGN:
        case EthereumMethodType.PERSONAL_SIGN: {
            const params = payload.params?.slice() as [string, string]
            const [account, data] = payload.method === EthereumMethodType.PERSONAL_SIGN ? params.reverse() : params

            if (options?.owner && options.identifier) {
                const { signature } = await generateSignResult('message', options.identifier, data)
                callback(null, createJsonRpcResponse(payload.id as number, signature))
            } else {
                try {
                    callback(
                        null,
                        createJsonRpcResponse(payload.id as number, await WalletRPC.signPersonalMessage(data, account)),
                    )
                } catch (error) {
                    callback(ErrorEditor.from(error, null, 'Failed to sign message.').error)
                }
            }

            break
        }
        case EthereumMethodType.ETH_DECRYPT:
            callback(new Error('Method Not implemented.'))
            break
        case EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY:
            callback(new Error('Method Not implemented.'))
            break
        default:
            await provider.send(payload, callback)
            break
    }
}

const UNCONFIRMED_CALLBACK_MAP = new Map<number, (error: Error | null, response?: JsonRpcResponse) => void>()

let id = 0

/**
 * The entrance of all RPC requests to MaskWallet.
 */
export async function send(payload: JsonRpcPayload, options?: Options) {
    return new Promise<JsonRpcResponse>(async (resolve, reject) => {
        const callback = (error: Error | null, response?: JsonRpcResponse) => {
            if (!isNil(error) || !isNil(response?.error)) {
                reject(ErrorEditor.from(error, response).error)
            } else if (response) resolve(response)
        }

        id += 1

        const editor = PayloadEditor.fromPayload({
            ...payload,
            id,
        })
        if (editor.risky) {
            await WalletRPC.pushUnconfirmedRequest(editor.fill())
            UNCONFIRMED_CALLBACK_MAP.set(editor.pid!, callback)
            if (options?.popupsWindow) openPopupWindow()
            return
        }

        await internalSend(payload, callback, options)
    })
}

export async function confirmRequest(payload: JsonRpcPayload, options?: Options) {
    const { pid } = PayloadEditor.fromPayload(payload)
    if (!pid) return

    const [deferred, resolve, reject] = defer<JsonRpcResponse, Error>()

    internalSend(
        payload,
        (error, response) => {
            UNCONFIRMED_CALLBACK_MAP.get(pid)?.(error, response)
            if (!response) {
                reject(new Error('No response.'))
                return
            }
            const editor = ErrorEditor.from(error, response)
            if (editor.presence) {
                reject(editor.error)
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
    const { pid } = PayloadEditor.fromPayload(payload)
    if (!pid) return
    UNCONFIRMED_CALLBACK_MAP.get(pid)?.(new Error('User rejected transaction.'))
    await WalletRPC.deleteUnconfirmedRequest(payload)
    await removePopupWindow()
    UNCONFIRMED_CALLBACK_MAP.delete(pid)
}
