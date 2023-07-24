import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter,
    RequestArguments,
} from '@masknet/web3-shared-flow'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { FlowWeb3StateRef } from './Web3StateAPI.js'
import { FlowOthersAPI } from './OthersAPI.js'

export class FlowConnectionOptionsAPI extends ConnectionOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
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
