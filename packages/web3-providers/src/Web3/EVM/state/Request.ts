import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import type { RequestArguments } from '@masknet/web3-shared-evm'
import { RequestState } from '../../Base/state/Request.js'

export class Request extends RequestState<RequestArguments> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, { pluginID: NetworkPluginID.PLUGIN_EVM })
    }
}
