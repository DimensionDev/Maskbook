import { omitBy } from 'lodash-es'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { EMPTY_OBJECT, PopupRoutes, Sniffings, type StorageItem } from '@masknet/shared-base'
import { MessageStateType, type ReasonableMessage } from '@masknet/web3-shared-base'
import {
    createJsonRpcPayload,
    PayloadEditor,
    type MessageRequest,
    type MessageResponse,
    type TransactionOptions,
    EthereumMethodType,
    ErrorEditor,
} from '@masknet/web3-shared-evm'
import { isUndefined } from '@walletconnect/utils'
import { MessageState } from '../../Base/state/Message.js'
import { EVMWeb3Readonly } from '../apis/ConnectionReadonlyAPI.js'
import type { WalletAPI } from '../../../entry-types.js'

export class EVMMessage extends MessageState<MessageRequest, MessageResponse> {
    constructor(
        private context: WalletAPI.MessageIOContext,
        storage: StorageItem<Record<string, ReasonableMessage<MessageRequest, MessageResponse>>>,
    ) {
        super(storage)
    }

    // requests can be kept when chain changed
    protected override isChainUnrelated(message: MessageRequest): boolean {
        const method = message.arguments.method
        return [
            // Note: do not add sign methods. For safety, we limit them as chain-specific to prevent attacks like
            // signing on a testnet and replaying on the mainnet.
            EthereumMethodType.wallet_watchAsset,
            EthereumMethodType.wallet_requestPermissions,
            EthereumMethodType.wallet_addEthereumChain,
        ].includes(method)
    }
    // requests can be kept when nonce changed (a transaction sent)
    protected override isNonceUnrelated(message: MessageRequest): boolean {
        const method = message.arguments.method
        return [
            EthereumMethodType.eth_sign,
            EthereumMethodType.eth_signTypedData_v4,
            EthereumMethodType.personal_sign,
            EthereumMethodType.wallet_addEthereumChain,
            EthereumMethodType.wallet_watchAsset,
            EthereumMethodType.wallet_requestPermissions,
        ].includes(method)
    }
    private resolveRequest(request: MessageRequest, updates?: MessageRequest): MessageRequest {
        const args = updates?.arguments ? { ...request.arguments, ...updates.arguments } : request.arguments
        const options = updates?.options ? { ...request.options, ...updates.options } : request.options
        return { arguments: args, options }
    }

    private async updateRequest(request_: MessageRequest, updates?: MessageRequest): Promise<MessageRequest> {
        const request = this.resolveRequest(request_, updates)

        const { method, chainId, config } = PayloadEditor.fromMethod(request.arguments.method, request.arguments.params)
        if (method !== EthereumMethodType.eth_sendTransaction) return request

        // recheck the nonce and update it if needed before sending with the transaction
        if (config.from && typeof config.nonce !== 'undefined') {
            const nonce = await EVMWeb3Readonly.getTransactionNonce(config.from, {
                chainId,
            })

            if (nonce > config.nonce) {
                request.arguments.params = [{ ...config, nonce }]
            }
        }

        return request
    }

    protected override async waitForApprovingRequest(
        id: string,
    ): Promise<ReasonableMessage<MessageRequest, MessageResponse>> {
        const { request } = this.assertMessage(id)

        if (request.options.silent) {
            await this.approveAndSendRequest(id)
        } else {
            // TODO: make this for Mask Wallet only
            const hasPassword = await this.context.hasPaymentPassword()
            const route = !hasPassword ? PopupRoutes.SetPaymentPassword : PopupRoutes.ContractInteraction

            const fromState =
                route !== PopupRoutes.ContractInteraction ? { from: PopupRoutes.ContractInteraction } : EMPTY_OBJECT

            if (Sniffings.is_popup_page) {
                await this.context.openPopupWindow(route, fromState as any)
            } else {
                // open the popups window and wait for approval from the user.
                await this.context.openPopupWindow(route, {
                    source: location.origin,
                })
            }
        }

        return super.waitForApprovingRequest(id)
    }

    async approveAndSendRequest(id: string, updates?: MessageRequest): Promise<JsonRpcResponse | void> {
        const { request: request_ } = this.assertMessage(id)

        const request = await this.updateRequest(request_, updates)
        const response = await this.context.send(
            createJsonRpcPayload(0, request.arguments),
            omitBy<TransactionOptions>(request.options, isUndefined),
        )
        const error = ErrorEditor.from(null, response)
        if (error.presence) return response

        await this.updateMessage(id, {
            request,
            response,
            state: MessageStateType.APPROVED,
        })

        // deny all requests after approving one
        await this.rejectRequests({
            keepChainUnrelated: this.isChainUnrelated(request),
            keepNonceUnrelated: this.isNonceUnrelated(request),
        })

        return response
    }
}
