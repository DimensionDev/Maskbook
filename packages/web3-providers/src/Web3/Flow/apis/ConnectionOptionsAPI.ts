import { getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-flow'
import type { ChainId, ProviderType, NetworkType, Transaction } from '@masknet/web3-shared-flow'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { FlowWeb3StateRef } from './Web3StateAPI.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { createConnectionCreator } from '../../Base/apis/ConnectionCreatorAPI.js'
import { FlowConnectionAPI } from './ConnectionAPI.js'
import { FlowOthersAPI } from './OthersAPI.js'

export class FlowConnectionOptionsAPI extends ConnectionOptionsAPI_Base<
    ChainId,
    ProviderType,
    NetworkType,
    Transaction
> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getDefaultProviderType = getDefaultProviderType
    protected override getProvider() {
        return FlowWeb3StateRef.value.Provider
    }
}
export const createFlowConnection = createConnectionCreator<NetworkPluginID.PLUGIN_FLOW>(
    (initial) => new FlowConnectionAPI(initial),
    FlowOthersAPI.isValidChainId,
    new FlowConnectionOptionsAPI(),
)
