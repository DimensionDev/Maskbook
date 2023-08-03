import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
    Web3State,
} from '@masknet/web3-shared-evm'
import { ValueRefWithReady } from '@masknet/shared-base'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { OthersAPI } from './OthersAPI.js'

const Web3Others = new OthersAPI()

const EmptyRef = new ValueRefWithReady<Web3State>({})

export class ConnectionOptionsReadonlyAPI extends ConnectionOptionsAPI_Base<
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
        return EmptyRef
    }

    override get Web3Others() {
        return Web3Others
    }
}
