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

const Web3Others = new FlowOthersAPI()

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
    override get Web3StateRef() {
        return FlowWeb3StateRef
    }

    override get Web3Others() {
        return Web3Others
    }
}
