import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import type { RequestArguments, RequestOptions } from '@masknet/web3-shared-evm'
import { RequestState } from '../../Base/state/Request.js'

export class Request extends RequestState<RequestArguments, RequestOptions> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, { pluginID: NetworkPluginID.PLUGIN_EVM })
    }
}
