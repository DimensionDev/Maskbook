import type { JsonRpcRequest } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, SignType } from '@masknet/shared-base'
import {
    createFireflyEmbeddedWallet,
    EVMRequestReadonly,
    EVMWalletProviders,
    EVMWeb3Readonly,
} from '@masknet/web3-providers'
import {
    ChainId,
    createJsonRpcResponse,
    ErrorEditor,
    EthereumMethodType,
    PayloadEditor,
    type TransactionOptions,
} from '@masknet/web3-shared-evm'
import { signWithPersona } from '../../identity/persona/sign.js'
import type { TransactionSerializable } from 'viem'

/**
 * The entrance of all RPC requests that must be signed in the background
 * (silent requests bypass the popup approval UI and land here directly).
 * Requests are signed either by a persona identity or by the currently
 * active Firefly embedded wallet — Mask no longer manages local key material.
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
            EVMWalletProviders[options.providerType].subscription?.chainId.getCurrentValue()
        :   undefined
    const requestChainId = providerChainId ?? chainId
    const identifier = ECKeyIdentifier.from(options?.identifier).unwrapOr(undefined)
    const address = owner || from!

    const requestFirefly = async (method: string, params: object | unknown[] | undefined) => {
        const provider = await createFireflyEmbeddedWallet(address).getEthereumProvider()
        return provider.request({ method, params })
    }

    const signTransaction = async (transaction: TransactionSerializable) => {
        if (identifier) {
            const message = { type: SignType.Transaction as const, data: transaction }
            return signWithPersona(message, identifier, undefined, false, providerChainId)
        }
        return requestFirefly(EthereumMethodType.eth_signTransaction, payload.params)
    }
    const signMessageOrTypedData = async (type: SignType.Message | SignType.TypedData, message: string) => {
        if (identifier) {
            const msg = { type, data: message }
            return signWithPersona(msg, identifier)
        }
        return type === SignType.TypedData ?
                requestFirefly(EthereumMethodType.eth_signTypedData_v4, payload.params)
            :   requestFirefly(EthereumMethodType.personal_sign, [message])
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
                if (identifier) {
                    return createJsonRpcResponse(
                        pid,
                        await EVMWeb3Readonly.sendSignedTransaction(await signTransaction(signableTransaction), {
                            chainId: requestChainId,
                            providerURL,
                        }),
                    )
                }
                // Firefly's backend signs and broadcasts in a single call.
                const hash = await requestFirefly(EthereumMethodType.eth_sendTransaction, payload.params)
                return createJsonRpcResponse(pid, hash)
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
