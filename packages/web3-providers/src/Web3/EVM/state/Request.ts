import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorContextRef } from '@masknet/plugin-infra/dom'
import type { RequestArguments, RequestOptions } from '@masknet/web3-shared-evm'
import type { TransferableRequest, ReasonableRequest } from '@masknet/web3-shared-base'
import { RequestState } from '../../Base/state/Request.js'

export class Request extends RequestState<RequestArguments, RequestOptions> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, { pluginID: NetworkPluginID.PLUGIN_EVM })
    }
    override async applyAndWaitRequest(
        request: TransferableRequest<RequestArguments, RequestOptions>,
    ): Promise<ReasonableRequest<RequestArguments, RequestOptions>> {
        const { ID } = await super.applyRequest(request)

        // open the popups window and wait for approvement from the user.
        SNSAdaptorContextRef.value.openPopupWindow()

        return super.waitRequest(ID)
    }
}
