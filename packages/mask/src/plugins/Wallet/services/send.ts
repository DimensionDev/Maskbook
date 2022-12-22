import { isNil, omit } from 'lodash-es'
import { defer } from '@masknet/kit'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { Web3 } from '@masknet/web3-providers'
import {
    ChainId,
    createJsonRpcResponse,
    ErrorEditor,
    EthereumMethodType,
    PayloadEditor,
} from '@masknet/web3-shared-evm'
import { WalletRPC } from '../messages.js'
import { openPopupWindow, removePopupWindow } from '../../../../background/services/helper/index.js'

interface Options {
    account?: string
    chainId?: ChainId
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
    const chainId = options?.chainId ?? ChainId.Mainnet
    const provider = Web3.createProvider(chainId)

    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION:
        case EthereumMethodType.MASK_REPLACE_TRANSACTION:
            const config = PayloadEditor.fromPayload(payload).signableConfig
            if (!config?.from || !config.to) return

            const signed = await WalletRPC.signTransaction(config.from as string, {
                chainId,
                ...config,
            })
            provider.send(
                {
                    ...payload,
                    method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                    params: [signed],
                },
                callback,
            )
            break
        case EthereumMethodType.ETH_SIGN_TYPED_DATA:
            const [address, dataToSign] = payload.params as [string, string]
            const dataSigned = await WalletRPC.signTypedData(address, dataToSign)
            try {
                callback(null, createJsonRpcResponse(payload.id as number, dataSigned))
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to sign message.').error)
            }
            break
        case EthereumMethodType.PERSONAL_SIGN:
            const [data, account] = payload.params as [string, string]
            const messageSigned = await WalletRPC.signPersonalMessage(data, account)
            try {
                callback(null, createJsonRpcResponse(payload.id as number, messageSigned))
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to sign message.').error)
            }
            break
        default:
            provider.send(payload, callback)
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

        if (options?.chainId === ChainId.Astar) {
            await internalSend(
                {
                    ...payload,
                    params: payload.params?.map((x) => {
                        if (x?.chainId) return omit(x, 'chainId')
                        return x
                    }),
                },
                callback,
                options,
            )

            return
        }
        internalSend(payload, callback, options)
    })
}

export async function confirmRequest(payload: JsonRpcPayload, options?: Options) {
    const { pid } = PayloadEditor.fromPayload(payload)
    if (!pid) return

    const [deferred, resolve, reject] = defer<JsonRpcResponse | undefined, Error>()
    internalSend(
        payload,
        (error, response) => {
            UNCONFIRMED_CALLBACK_MAP.get(pid)?.(error, response)
            if (error) {
                reject(error)
                return
            }
            if (response?.error) {
                reject(new Error(`Failed to send transaction: ${response.error?.message ?? response.error}`))
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
