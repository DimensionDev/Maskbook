import { getDefaultChainId, type ChainId, getNetworkPluginID } from '@masknet/web3-shared-flow'
import { HubOptionsProvider } from '../../Base/apis/HubOptions.js'
import { flow } from '../../../Manager/registry.js'

export class FlowHubOptionsAPI extends HubOptionsProvider<ChainId> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkPluginID = getNetworkPluginID

    protected override getAccount() {
        return flow.state?.Provider?.account?.getCurrentValue()
    }

    protected override getChainId() {
        return flow.state?.Provider?.chainId?.getCurrentValue()
    }

    protected override getCurrencyType() {
        return flow.state?.Settings?.currencyType?.getCurrentValue()
    }
}
