import { omitBy } from 'lodash-es'
import urlcat from 'urlcat'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { EMPTY_OBJECT, PopupRoutes, PopupsHistory, Sniffings, type StorageItem } from '@masknet/shared-base'
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

    protected resolveRequest(request: MessageRequest, updates?: MessageRequest): MessageRequest {
        return {
            arguments:
                updates?.arguments ?
                    {
                        ...request.arguments,
                        ...updates.arguments,
                    }
                :   request.arguments,
            options:
                updates?.options ?
                    {
                        ...request.options,
                        ...updates.options,
                    }
                :   request.options,
        }
    }

    protected async updateRequest(request_: MessageRequest, updates?: MessageRequest): Promise<MessageRequest> {
        const request = this.resolveRequest(request_, updates)

        const { method, chainId, config } = PayloadEditor.fromMethod(request.arguments.method, request.arguments.params)
        if (method !== EthereumMethodType.ETH_SEND_TRANSACTION) return request

        // recheck the nonce and update it if needed before sending with the transaction
        if (config.from && typeof config.nonce !== 'undefined') {
            const nonce = await EVMWeb3Readonly.getTransactionNonce(config.from, {
                chainId,
            })

            if (nonce > config.nonce) {
                request.arguments.params = [
                    {
                        ...config,
                        nonce,
                    },
                ]
            }
        }

        return request
    }

    protected override async waitForApprovingRequest(
        id: string,
    ): Promise<ReasonableMessage<MessageRequest, MessageResponse>> {
        const { request } = this.assertMessage(id)

        if (request.options.silent) {
            await this.approveRequest(id)
        } else {
            // TODO: make this for Mask Wallet only
            const hasPassword = await this.context.hasPaymentPassword()
            const route = !hasPassword ? PopupRoutes.SetPaymentPassword : PopupRoutes.ContractInteraction

            const fromState =
                route !== PopupRoutes.ContractInteraction ? { from: PopupRoutes.ContractInteraction } : EMPTY_OBJECT

            if (Sniffings.is_popup_page && !location.hash.includes('/swap')) {
                PopupsHistory.push(urlcat(PopupRoutes.Wallet, fromState))
            } else {
                // open the popups window and wait for approval from the user.
                await this.context.openPopupWindow(route, {
                    source: location.origin,
                })
            }
        }

        return super.waitForApprovingRequest(id)
    }

    override async approveRequest(id: string, updates?: MessageRequest): Promise<JsonRpcResponse | void> {
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
        await this.denyAllRequests()

        return response
    }
}
