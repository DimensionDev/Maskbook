import urlcat from 'urlcat'
import { omitBy } from 'lodash-es'
import { isUndefined } from '@walletconnect/utils'
import {
    EMPTY_OBJECT,
    LockStatus,
    NetworkPluginID,
    PopupRoutes,
    PopupsHistory,
    Sniffings,
    currentMaskWalletLockStatusSettings,
} from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { SiteAdaptorContextRef } from '@masknet/plugin-infra/dom'
import {
    createJsonRpcPayload,
    type MessageRequest,
    type MessageResponse,
    type TransactionOptions,
} from '@masknet/web3-shared-evm'
import { MessageStateType, type ReasonableMessage } from '@masknet/web3-shared-base'
import { MessageState } from '../../Base/state/Message.js'
import { SharedContextRef } from '../../../PluginContext/index.js'

export class Message extends MessageState<MessageRequest, MessageResponse> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, { pluginID: NetworkPluginID.PLUGIN_EVM })
    }

    protected override async waitForApprovingRequest(
        id: string,
    ): Promise<ReasonableMessage<MessageRequest, MessageResponse>> {
        const { request } = this.assertMessage(id)

        if (request.options.silent) {
            await this.approveRequest(id)
        } else {
            // TODO: make this for Mask Wallet only
            const hasPassword = await SiteAdaptorContextRef.value.hasPaymentPassword()
            const route = !hasPassword
                ? PopupRoutes.SetPaymentPassword
                : currentMaskWalletLockStatusSettings.value === LockStatus.LOCKED
                ? PopupRoutes.Unlock
                : PopupRoutes.ContractInteraction

            const fromState =
                route !== PopupRoutes.ContractInteraction ? { from: PopupRoutes.ContractInteraction } : EMPTY_OBJECT

            if (Sniffings.is_popup_page && !location.hash.includes('/swap')) {
                PopupsHistory.push(urlcat(route, fromState))
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

    override async approveRequest(id: string, updates?: MessageRequest): Promise<void> {
        const { request } = this.assertMessage(id)

        const response = await SharedContextRef.value.send(
            createJsonRpcPayload(
                0,
                updates?.arguments
                    ? {
                          ...request.arguments,
                          ...updates.arguments,
                      }
                    : request.arguments,
            ),
            omitBy<TransactionOptions>(request.options, isUndefined),
        )

        await this.updateMessage(id, {
            request: {
                ...request,
                ...updates,
            },
            state: MessageStateType.APPROVED,
            response,
        })
    }
}
