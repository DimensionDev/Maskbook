import { omitBy } from 'lodash-es'
import { isUndefined } from '@walletconnect/utils'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorContextRef } from '@masknet/plugin-infra/dom'
import {
    createJsonRpcPayload,
    createJsonRpcResponse,
    type MessageRequest,
    type MessageResponse,
    type TransactionOptions,
} from '@masknet/web3-shared-evm'
import { MessageStateType, type ReasonableMessage } from '@masknet/web3-shared-base'
import { MessageState } from '../../Base/state/Message.js'
import { RequestReadonlyAPI } from '../apis/RequestReadonlyAPI.js'
import { SharedContextRef } from '../../../PluginContext/index.js'

export class Message extends MessageState<MessageRequest, MessageResponse> {
    private Request = new RequestReadonlyAPI()

    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, { pluginID: NetworkPluginID.PLUGIN_EVM })
    }

    protected override async waitForApprovingRequest(
        id: string,
    ): Promise<ReasonableMessage<MessageRequest, MessageResponse>> {
        const message = this.assertMessage(id)

        if (message.request.options?.silent) {
            // TODO: make this for Mask Wallet only
            // open the popups window and wait for approvement from the user.
            await SNSAdaptorContextRef.value.openPopupWindow()
        }

        return super.waitForApprovingRequest(id)
    }

    override async broadcastRequest(id: string): Promise<void> {
        const message = this.assertMessage(id)
        const response = message.request.options?.providerURL
            ? createJsonRpcResponse(
                  0,
                  await this.Request.request(message.request.arguments, {
                      providerURL: message.request.options.providerURL,
                  }),
              )
            : await SharedContextRef.value.send(
                  createJsonRpcPayload(0, message.request.arguments),
                  omitBy<TransactionOptions>(message.request.options, isUndefined),
              )

        await this.updateRequest(id, {
            state: MessageStateType.BROADCASTED,
            response,
        })
    }
}
