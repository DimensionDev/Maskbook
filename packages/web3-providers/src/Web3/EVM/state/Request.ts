import { omitBy } from 'lodash-es'
import { isUndefined } from '@walletconnect/utils'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorContextRef } from '@masknet/plugin-infra/dom'
import {
    createJsonRpcPayload,
    createJsonRpcResponse,
    type RequestArguments,
    type RequestOptions,
    type TransactionOptions,
} from '@masknet/web3-shared-evm'
import { RequestStateType, type ReasonableRequest } from '@masknet/web3-shared-base'
import { RequestState } from '../../Base/state/Request.js'
import { RequestReadonlyAPI } from '../apis/RequestReadonlyAPI.js'
import { SharedContextRef } from '../../../PluginContext/index.js'

export class Request extends RequestState<RequestArguments, RequestOptions> {
    private Request = new RequestReadonlyAPI()

    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, { pluginID: NetworkPluginID.PLUGIN_EVM })
    }

    protected override async waitForApprovingRequest(
        id: string,
    ): Promise<ReasonableRequest<RequestArguments, RequestOptions>> {
        const request = this.assertNetwork(id)

        if (request.options?.silent) {
            // TODO: make this for Mask Wallet only
            // open the popups window and wait for approvement from the user.
            await SNSAdaptorContextRef.value.openPopupWindow()
        }

        return super.waitForApprovingRequest(id)
    }

    override async broadcastRequest(id: string): Promise<void> {
        const request = this.assertNetwork(id)
        const response = request.options?.providerURL
            ? createJsonRpcResponse(
                  0,
                  await this.Request.request(request.arguments, {
                      providerURL: request.options.providerURL,
                  }),
              )
            : await SharedContextRef.value.send(
                  createJsonRpcPayload(0, request.arguments),
                  omitBy<TransactionOptions>(request.options, isUndefined),
              )

        await this.updateRequest(id, {
            state: RequestStateType.BROADCASTED,
            result: response,
        })
    }
}
