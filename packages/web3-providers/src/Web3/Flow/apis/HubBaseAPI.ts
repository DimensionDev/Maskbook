import type { ChainId, GasOption, SchemaType } from '@masknet/web3-shared-flow'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { BaseHubProvider } from '../../Base/apis/HubBase.js'

export class FlowBaseHub extends BaseHubProvider<ChainId, SchemaType, GasOption> {
    override getGasOptions = undefined
    override getGasLimit = undefined
    override getTransactions = undefined
    protected override HubOptions = new FlowHubOptionsAPI(this.options)
}
