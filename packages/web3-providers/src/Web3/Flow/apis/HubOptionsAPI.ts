import { getDefaultChainId, type ChainId, getNetworkPluginID } from '@masknet/web3-shared-flow'
import { HubOptionsProvider } from '../../Base/apis/HubOptionsAPI.js'
import { FlowWeb3StateRef } from './Web3StateAPI.js'

export class FlowHubOptionsAPI extends HubOptionsProvider<ChainId> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkPluginID = getNetworkPluginID
    protected override getAccount() {
        return FlowWeb3StateRef.value?.Provider?.account?.getCurrentValue()
    }
    protected override getChainId() {
        return FlowWeb3StateRef.value?.Provider?.chainId?.getCurrentValue()
    }
    protected override getCurrencyType() {
        return FlowWeb3StateRef.value?.Settings?.currencyType?.getCurrentValue()
    }
}
