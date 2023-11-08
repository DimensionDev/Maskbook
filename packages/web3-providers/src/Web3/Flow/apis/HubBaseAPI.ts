import type { ChainId, GasOption, SchemaType } from '@masknet/web3-shared-flow'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { HubBaseAPI_Base } from '../../Base/apis/HubBaseAPI.js'

export class FlowHubBaseAPI extends HubBaseAPI_Base<ChainId, SchemaType, GasOption> {
    override getGasOptions = undefined
    override getTransactions = undefined
    protected override HubOptions = new FlowHubOptionsAPI(this.options)
}
