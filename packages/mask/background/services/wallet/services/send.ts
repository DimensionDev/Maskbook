import type { JsonRpcPayload } from 'web3-core-helpers'
import { ECKeyIdentifier, type SignType } from '@masknet/shared-base'
import { EVMRequestReadonly, SmartPayAccount, EVMWeb3Readonly } from '@masknet/web3-providers'
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
import { signWithWallet } from './wallet/index.js'
import { signWithPersona } from '../../identity/persona/sign.js'

/**
 * The entrance of all RPC requests to MaskWallet.
 */
export async function send(payload: JsonRpcPayload, options?: TransactionOptions) {
    const { owner, paymentToken, providerURL } = options ?? {}
    const {
        pid = 0,
        from,
        chainId = options?.chainId ?? ChainId.Mainnet,
        signableMessage,
        signableConfig,
    } = PayloadEditor.fromPayload(payload, options)
    const identifier = ECKeyIdentifier.from(options?.identifier).unwrapOr(undefined)
    const signer =
        identifier ?
            new Signer(identifier, <T>(type: SignType, message: T, identifier?: ECKeyIdentifier) =>
                signWithPersona(type, message, identifier, undefined, true),
            )
        :   new Signer(owner || from!, signWithWallet)

    switch (payload.method) {
        case EthereumMethodType.eth_sendTransaction:
        case EthereumMethodType.MASK_REPLACE_TRANSACTION:
            if (!signableConfig) throw new Error('No transaction to be sent.')

            try {
                if (owner && paymentToken) {
                    return createJsonRpcResponse(
                        pid,
                        await SmartPayAccount.sendTransaction(chainId, owner, signableConfig, signer, {
                            paymentToken,
                        }),
                    )
                } else {
                    return createJsonRpcResponse(
                        pid,
                        await EVMWeb3Readonly.sendSignedTransaction(await signer.signTransaction(signableConfig), {
                            chainId,
                            providerURL,
                        }),
                    )
                }
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to send transaction.').error
            }
        case EthereumMethodType.eth_sign:
        case EthereumMethodType.personal_sign:
            try {
                if (!signableMessage) throw new Error('No message to be signed.')
                return createJsonRpcResponse(pid, await signer.signMessage(signableMessage))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to sign message.').error
            }
        case EthereumMethodType.eth_signTypedData_v4:
            try {
                if (!signableMessage) throw new Error('No typed data to be signed.')
                return createJsonRpcResponse(pid, await signer.signTypedData(signableMessage))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to sign typed data.').error
            }
        case EthereumMethodType.eth_signTransaction:
            try {
                if (!signableConfig) throw new Error('No transaction to be signed.')
                return createJsonRpcResponse(pid, await signer.signTransaction(signableConfig))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to sign transaction.').error
            }
        case EthereumMethodType.MASK_DEPLOY:
            try {
                const [owner] = payload.params as [string]
                if (!isValidAddress(owner)) throw new Error('Invalid sender address.')
                return createJsonRpcResponse(pid, await SmartPayAccount.deploy(chainId, owner, signer))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to deploy.').error
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
