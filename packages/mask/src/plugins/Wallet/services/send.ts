import { isNil } from 'lodash-es'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { defer } from '@masknet/kit'
import { ECKeyIdentifier, type SignType } from '@masknet/shared-base'
import { SmartPayAccount, Web3 } from '@masknet/web3-providers'
import {
    ChainId,
    createJsonRpcResponse,
    ErrorEditor,
    EthereumMethodType,
    isValidAddress,
    PayloadEditor,
    type TransactionOptions,
    Signer,
} from '@masknet/web3-shared-evm'
import { WalletRPC } from '../messages.js'
import { signWithWallet } from './wallet/index.js'
import { openPopupWindow, removePopupWindow } from '../../../../background/services/helper/index.js'
import { signWithPersona } from '../../../../background/services/identity/index.js'

/**
 * Send to built-in RPC endpoints.
 */
async function internalSend(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    options?: TransactionOptions,
): Promise<void> {
    const {
        pid = 0,
        from,
        chainId = options?.chainId ?? ChainId.Mainnet,
        signableMessage,
        signableConfig,
    } = PayloadEditor.fromPayload(payload, options)
    const owner = options?.owner
    const identifier = ECKeyIdentifier.from(options?.identifier).unwrapOr(undefined)
    const paymentToken = options?.paymentToken
    const signer = identifier
        ? new Signer(identifier, <T>(type: SignType, message: T, identifier?: ECKeyIdentifier) =>
              signWithPersona(type, message, identifier, true),
          )
        : new Signer(owner || from!, signWithWallet)

    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION:
        case EthereumMethodType.MASK_REPLACE_TRANSACTION:
            try {
                if (!signableConfig) throw new Error('No transaction to be sent.')
                if (owner && paymentToken) {
                    callback(
                        null,
                        createJsonRpcResponse(
                            pid,
                            await SmartPayAccount.sendTransaction(chainId, owner, signableConfig, signer, {
                                paymentToken,
                            }),
                        ),
                    )
                } else {
                    callback(
                        null,
                        createJsonRpcResponse(
                            pid,
                            await Web3.sendSignedTransaction(await signer.signTransaction(signableConfig), { chainId }),
                        ),
                    )
                }
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to send transaction.').error)
            }
            break
        case EthereumMethodType.ETH_SIGN:
        case EthereumMethodType.PERSONAL_SIGN:
            try {
                if (!signableMessage) throw new Error('No message to be signed.')
                callback(null, createJsonRpcResponse(pid, await signer.signMessage(signableMessage)))
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to sign message.').error)
            }
            break
        case EthereumMethodType.ETH_SIGN_TYPED_DATA:
            try {
                if (!signableMessage) throw new Error('No typed data to be signed.')
                callback(null, createJsonRpcResponse(pid, await signer.signTypedData(signableMessage)))
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to sign typed data.').error)
            }
            break
        case EthereumMethodType.ETH_SIGN_TRANSACTION:
            try {
                if (!signableConfig) throw new Error('No transaction to be signed.')
                callback(null, createJsonRpcResponse(pid, await signer.signTransaction(signableConfig)))
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to sign transaction.').error)
            }
            break
        case EthereumMethodType.MASK_DEPLOY:
            try {
                const [owner] = payload.params as [string]
                if (!isValidAddress(owner)) throw new Error('Invalid sender address.')
                callback(null, createJsonRpcResponse(pid, await SmartPayAccount.deploy(chainId, owner, signer)))
            } catch (error) {
                callback(ErrorEditor.from(error, null, 'Failed to deploy.').error)
            }
            break
        case EthereumMethodType.ETH_DECRYPT:
            callback(new Error('Method not implemented.'))
            break
        case EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY:
            callback(new Error('Method not implemented.'))
            break
        default:
            await Web3.getWeb3Provider({ chainId }).send(payload, callback)
            break
    }
}

const UNCONFIRMED_CALLBACK_MAP = new Map<number, (error: Error | null, response?: JsonRpcResponse) => void>()

let id = 0

/**
 * The entrance of all RPC requests to MaskWallet.
 */
export async function send(payload: JsonRpcPayload, options?: TransactionOptions) {
    return new Promise<JsonRpcResponse>(async (resolve, reject) => {
        const callback = (error: Error | null, response?: JsonRpcResponse) => {
            if (!isNil(error) || !isNil(response?.error)) {
                reject(ErrorEditor.from(error, response).error)
            } else if (response) resolve(response)
        }

        id += 1

        const editor = PayloadEditor.fromPayload(
            {
                ...payload,
                id,
            },
            options,
        )
        if (editor.risky) {
            await WalletRPC.pushUnconfirmedRequest({
                ...editor.fill(),
                owner: options?.owner,
                identifier: options?.identifier,
                paymentToken: options?.paymentToken,
                allowMaskAsGas: options?.allowMaskAsGas,
            })
            UNCONFIRMED_CALLBACK_MAP.set(editor.pid!, callback)
            if (options?.popupsWindow) openPopupWindow()
        } else {
            await internalSend(payload, callback, options)
        }
    })
}

export async function confirmRequest(payload: JsonRpcPayload, options?: TransactionOptions) {
    const { pid } = PayloadEditor.fromPayload(payload, options)
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
