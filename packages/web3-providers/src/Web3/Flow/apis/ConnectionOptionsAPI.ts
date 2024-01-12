import { getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-flow'
import type { ChainId, ProviderType, NetworkType, Transaction } from '@masknet/web3-shared-flow'
import { ConnectionOptionsProvider } from '../../Base/apis/ConnectionOptions.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { createConnectionCreator } from '../../Base/apis/ConnectionCreator.js'
import { FlowConnectionAPI } from './ConnectionAPI.js'
import { FlowUtils } from './Utils.js'
import { flow } from '../../../Manager/registry.js'

export class FlowConnectionOptionsAPI extends ConnectionOptionsProvider<
    ChainId,
    ProviderType,
    NetworkType,
    Transaction
> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getDefaultProviderType = getDefaultProviderType

    protected override getProvider() {
        return flow.state?.Provider
    }
}

export const createFlowConnection = createConnectionCreator(
    NetworkPluginID.PLUGIN_FLOW,
    (initial) => new FlowConnectionAPI(initial),
    FlowUtils.isValidChainId,
    new FlowConnectionOptionsAPI(),
)
