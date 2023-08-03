import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-solana'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { SolanaOthersAPI } from './OthersAPI.js'
import { SolanaWeb3StateRef } from './Web3StateAPI.js'

const Web3Others = new SolanaOthersAPI()

export class SolanaConnectionOptionsAPI extends ConnectionOptionsAPI_Base<
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
        return SolanaWeb3StateRef
    }

    override get Web3Others() {
        return Web3Others
    }
}
