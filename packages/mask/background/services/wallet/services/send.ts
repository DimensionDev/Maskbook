import type { JsonRpcRequest } from 'web3-types'
import { ECKeyIdentifier, SignType } from '@masknet/shared-base'
import { EVMRequestReadonly, EVMWalletProviders, EVMWeb3Readonly } from '@masknet/web3-providers'
import {
    ChainId,
    createJsonRpcResponse,
    ErrorEditor,
    EthereumMethodType,
    PayloadEditor,
    type TransactionOptions,
} from '@masknet/web3-shared-evm'
import { signWithWallet } from './wallet/index.js'
import { signWithPersona } from '../../identity/persona/sign.js'
import type { TransactionSerializable } from 'viem'

/**
 * The entrance of all RPC requests to MaskWallet.
 */
export async function send(payload: JsonRpcRequest, options?: TransactionOptions) {
    const { owner, providerURL } = options ?? {}
    const {
        pid = 0,
        from,
        chainId = options?.chainId ?? ChainId.Mainnet,
        signableMessage,
        signableTransaction,
    } = PayloadEditor.fromPayload(payload, options)
    const isTransactionSigningMethod =
        payload.method === EthereumMethodType.eth_sendTransaction ||
        payload.method === EthereumMethodType.MASK_REPLACE_TRANSACTION ||
        payload.method === EthereumMethodType.eth_signTransaction
    const providerChainId =
        options?.providerType && isTransactionSigningMethod ?
            EVMWalletProviders[options.providerType].subscription.chainId.getCurrentValue()
        :   undefined
    const requestChainId = providerChainId ?? chainId
    const identifier = ECKeyIdentifier.from(options?.identifier).unwrapOr(undefined)
    const signTransaction = async (transaction: TransactionSerializable) => {
        const message = { type: SignType.Transaction as const, data: transaction }
        if (identifier) {
            return signWithPersona(message, identifier, undefined, false, providerChainId)
        } else {
            return signWithWallet(message, owner || from!, providerChainId)
        }
    }
    const signMessageOrTypedData = async (type: SignType.Message | SignType.TypedData, message: string) => {
        const msg = { type, data: message }
        if (identifier) {
            return signWithPersona(msg, identifier)
        } else {
            return signWithWallet(msg, owner || from!)
        }
    }

    switch (payload.method) {
        case EthereumMethodType.eth_sendTransaction:
        case EthereumMethodType.MASK_REPLACE_TRANSACTION:
            if (!signableTransaction) throw new Error('No transaction to be sent.')
            if (
                providerChainId !== undefined &&
                signableTransaction.chainId !== undefined &&
                signableTransaction.chainId !== providerChainId
            ) {
                throw new Error('Chain ID mismatch.')
            }

            try {
                return createJsonRpcResponse(
                    pid,
                    await EVMWeb3Readonly.sendSignedTransaction(await signTransaction(signableTransaction), {
                        chainId: requestChainId,
                        providerURL,
                    }),
                )
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to send transaction.').error
            }
        case EthereumMethodType.eth_sign:
        case EthereumMethodType.personal_sign:
            try {
                if (!signableMessage) throw new Error('No message to be signed.')
                return createJsonRpcResponse(pid, await signMessageOrTypedData(SignType.Message, signableMessage))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to sign message.').error
            }
        case EthereumMethodType.eth_signTypedData_v4:
            try {
                if (!signableMessage) throw new Error('No typed data to be signed.')
                return createJsonRpcResponse(pid, await signMessageOrTypedData(SignType.TypedData, signableMessage))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to sign typed data.').error
            }
        case EthereumMethodType.eth_signTransaction:
            try {
                if (!signableTransaction) throw new Error('No transaction to be signed.')
                return createJsonRpcResponse(pid, await signTransaction(signableTransaction))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to sign transaction.').error
            }
        default:
            try {
                const result = await EVMRequestReadonly.request(
                    {
                        method: payload.method as EthereumMethodType,
                        params: payload.params ?? [],
                    },
                    {
                        chainId,
                        providerURL,
                    },
                )
                return createJsonRpcResponse(pid, result)
            } catch (error) {
                throw error instanceof Error ? error : new Error('Failed to send request.')
            }
    }
}
