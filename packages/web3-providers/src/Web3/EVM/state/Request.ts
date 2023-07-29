import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorContextRef } from '@masknet/plugin-infra/dom'
import { EthereumMethodType, type RequestArguments, type RequestOptions } from '@masknet/web3-shared-evm'
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

        let target: PopupRoutes

        switch (request.arguments.method) {
            case EthereumMethodType.ETH_SIGN:
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
            case EthereumMethodType.PERSONAL_SIGN:
                target = PopupRoutes.WalletSignRequest
                break
            // TODO: approve and add network or more ethereum method type
            default:
                target = PopupRoutes.ContractInteraction
                break
        }
        // TODO: make this for Mask Wallet only
        // open the popups window and wait for approvement from the user.
        await SNSAdaptorContextRef.value.openPopupWindow(target, { source: location.origin })

        return super.waitRequest(ID)
    }
}
