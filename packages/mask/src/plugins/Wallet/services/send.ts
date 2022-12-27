import { isNil } from 'lodash-es'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { defer } from '@masknet/kit'
import { SmartPayAccount, Web3 } from '@masknet/web3-providers'
import { ECKeyIdentifier, SignType } from '@masknet/shared-base'
import {
    ChainId,
    createJsonRpcPayload,
    createJsonRpcResponse,
    ErrorEditor,
    EthereumMethodType,
    PayloadEditor,
    Transaction,
} from '@masknet/web3-shared-evm'
import { WalletRPC } from '../messages.js'
import { openPopupWindow, removePopupWindow } from '../../../../background/services/helper/index.js'
import { signWithPersona } from '../../../../background/services/identity/index.js'
import { signWithWallet } from './index.js'

function getSigner<T>(type: SignType, account: string, identifier?: ECKeyIdentifier) {
    return async (message: T) => {
        return identifier ? signWithPersona(type, message, identifier, true) : signWithWallet(type, message, account)
    }
}

interface Options {
    account?: string
    chainId?: ChainId
    owner?: string
    identifier?: ECKeyIdentifier
    disableClose?: boolean
    popupsWindow?: boolean
}

/**
 * Send to built-in RPC endpoints.
 */
async function internalSend(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    options?: Options,
): Promise<void> {
    const {
        pid = 0,
        from,
        message = '',
        chainId = options?.chainId ?? ChainId.Mainnet,
        signableConfig,
    } = PayloadEditor.fromPayload(payload)
    const { owner = from, identifier } = options ?? {}

    const messageSigner = getSigner<string>(SignType.Message, owner, identifier)
    const typedDataSigner = getSigner<string>(SignType.TypedData, owner, identifier)
    const transactionSigner = getSigner<Transaction>(SignType.Transaction, owner, identifier)

    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION:
        case EthereumMethodType.MASK_REPLACE_TRANSACTION:
            if (!signableConfig) return

            if (owner) {
                callback(
                    null,
                    createJsonRpcResponse(
                        pid,
                        await SmartPayAccount.sendTransaction(chainId, owner, signableConfig, messageSigner),
                    ),
                )
            } else {
                await Web3.createProvider(chainId).send(
                    createJsonRpcPayload(pid, {
                        method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                        params: [await transactionSigner(signableConfig)],
                    }),
                    callback,
                )
            }
            break
        case EthereumMethodType.ETH_SIGN_TYPED_DATA:
            try {
                callback(null, createJsonRpcResponse(pid, await typedDataSigner(message)))
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to sign message.').error)
            }
            break
        case EthereumMethodType.ETH_SIGN:
        case EthereumMethodType.PERSONAL_SIGN:
            try {
                callback(null, createJsonRpcResponse(pid, await messageSigner(message)))
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to sign message.').error)
            }
            break
        case EthereumMethodType.ETH_DECRYPT:
            callback(new Error('Method Not implemented.'))
            break
        case EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY:
            callback(new Error('Method Not implemented.'))
            break
        default:
            await Web3.createProvider(chainId).send(payload, callback)
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
