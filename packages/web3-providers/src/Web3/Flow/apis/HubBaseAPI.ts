import type {
    ChainId,
    GasOption,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { HubBaseAPI_Base } from '../../Base/apis/HubBaseAPI.js'

export class FlowHubBaseAPI extends HubBaseAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    Transaction,
    TransactionParameter,
    GasOption
> {
    protected override HubOptions = new FlowHubOptionsAPI(this.options)
}
