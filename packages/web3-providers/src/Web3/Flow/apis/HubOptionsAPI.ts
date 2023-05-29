import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { HubOptionsAPI_Base } from '../../Base/apis/HubOptionsAPI.js'
import { FlowWeb3StateRef } from './Web3StateAPI.js'
import { FlowOthersAPI } from './OthersAPI.js'

export class FlowHubOptionsAPI extends HubOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter
> {
    override get Web3StateRef() {
        return FlowWeb3StateRef
    }

    override get Web3Others() {
        return new FlowOthersAPI()
    }
}
