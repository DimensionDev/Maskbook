import type { JsonRpcPayload } from 'web3-core-helpers'
import { ECKeyIdentifier, type SignType } from '@masknet/shared-base'
import { RequestReadonly, SmartPayAccount, Web3Readonly } from '@masknet/web3-providers'
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
import { signWithPersona } from '../../../../background/services/identity/index.js'

/**
 * The entrance of all RPC requests to MaskWallet.
 */
export async function send(payload: JsonRpcPayload, options?: TransactionOptions) {
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
              signWithPersona(type, message, identifier, undefined, true),
          )
        : new Signer(owner || from!, signWithWallet)

    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION:
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
                        await Web3Readonly.sendSignedTransaction(await signer.signTransaction(signableConfig), {
                            chainId,
                        }),
                    )
                }
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to send transaction.').error
            }
        case EthereumMethodType.ETH_SIGN:
        case EthereumMethodType.PERSONAL_SIGN:
            try {
                if (!signableMessage) throw new Error('No message to be signed.')
                return createJsonRpcResponse(pid, await signer.signMessage(signableMessage))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to sign message.').error
            }
        case EthereumMethodType.ETH_SIGN_TYPED_DATA:
            try {
                if (!signableMessage) throw new Error('No typed data to be signed.')
                return createJsonRpcResponse(pid, await signer.signTypedData(signableMessage))
            } catch (error) {
                throw ErrorEditor.from(error, null, 'Failed to sign typed data.').error
            }
        case EthereumMethodType.ETH_SIGN_TRANSACTION:
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
        case EthereumMethodType.ETH_DECRYPT:
            throw new Error('Method not implemented.')
        case EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY:
            throw new Error('Method not implemented.')
        default:
            try {
                const result = await RequestReadonly.request(
                    {
                        method: payload.method as EthereumMethodType,
                        params: payload.params ?? [],
                    },
                    {
                        chainId,
                    },
                )
                return createJsonRpcResponse(pid, result)
            } catch (error) {
                throw error instanceof Error ? error : new Error('Failed to send request.')
            }
    }
}
