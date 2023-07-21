import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter,
    Web3State,
} from '@masknet/web3-shared-evm'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { ValueRefWithReady } from '@masknet/shared-base'
import { OthersAPI } from './OthersAPI.js'

const EmptyRef = new ValueRefWithReady<Web3State>({})

export class ConnectionOptionsReadonlyAPI extends ConnectionOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter
> {
    override get Web3StateRef() {
        return EmptyRef
    }

    override get Web3Others() {
        return new OthersAPI()
    }
}
