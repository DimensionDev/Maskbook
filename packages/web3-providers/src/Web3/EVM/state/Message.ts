import { omitBy } from 'lodash-es'
import urlcat from 'urlcat'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { SiteAdaptorContextRef } from '@masknet/plugin-infra/dom'
import { EMPTY_OBJECT, NetworkPluginID, PopupRoutes, PopupsHistory, Sniffings } from '@masknet/shared-base'
import { MessageStateType, type ReasonableMessage } from '@masknet/web3-shared-base'
import {
    createJsonRpcPayload,
    type MessageRequest,
    type MessageResponse,
    type TransactionOptions,
} from '@masknet/web3-shared-evm'
import { isUndefined } from '@walletconnect/utils'
import type { WalletAPI } from '../../../entry-types.js'
import { MessageState } from '../../Base/state/Message.js'

export class Message extends MessageState<MessageRequest, MessageResponse> {
    constructor(context: WalletAPI.IOContext) {
        super(context, { pluginID: NetworkPluginID.PLUGIN_EVM })
    }

    protected resolveRequest(request: MessageRequest, updates?: MessageRequest): MessageRequest {
        return {
            arguments: updates?.arguments
                ? {
                      ...request.arguments,
                      ...updates.arguments,
                  }
                : request.arguments,
            options: updates?.options
                ? {
                      ...request.options,
                      ...updates.options,
                  }
                : request.options,
        }
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
                await SiteAdaptorContextRef.value.openPopupWindow(route, {
                    source: location.origin,
                    ...fromState,
                })
            }
        }

        return super.waitForApprovingRequest(id)
    }

    override async approveRequest(id: string, updates?: MessageRequest): Promise<JsonRpcResponse | void> {
        const { request: request_ } = this.assertMessage(id)

        const request = this.resolveRequest(request_, updates)
        const response = await this.context.send(
            createJsonRpcPayload(0, request.arguments),
            omitBy<TransactionOptions>(request.options, isUndefined),
        )

        await this.updateMessage(id, {
            request,
            response,
            state: MessageStateType.APPROVED,
        })
        return response
    }
}
