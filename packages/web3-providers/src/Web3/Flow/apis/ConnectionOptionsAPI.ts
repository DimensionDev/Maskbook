import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { FlowWeb3StateRef } from './Web3StateAPI.js'
import { FlowOthersAPI } from './OthersAPI.js'

export class FlowConnectionOptionsAPI extends ConnectionOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    private Others = new FlowOthersAPI()

    override get Web3StateRef() {
        return FlowWeb3StateRef
    }

    override get Web3Others() {
        return this.Others
    }
}
