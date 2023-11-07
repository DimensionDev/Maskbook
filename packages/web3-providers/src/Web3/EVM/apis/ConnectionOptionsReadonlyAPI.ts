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
    readonly Web3StateRef = EmptyRef
    readonly Web3Others = OthersAPI
}
