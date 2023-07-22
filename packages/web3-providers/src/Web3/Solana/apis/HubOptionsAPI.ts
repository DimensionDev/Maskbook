import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter,
    RequestArguments,
} from '@masknet/web3-shared-solana'
import { HubOptionsAPI_Base } from '../../Base/apis/HubOptionsAPI.js'
import { SolanaOthersAPI } from './OthersAPI.js'
import { SolanaWeb3StateRef } from './Web3StateAPI.js'

export class SolanaHubOptionsAPI extends HubOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    Transaction,
    TransactionParameter
> {
    override get Web3StateRef() {
        return SolanaWeb3StateRef
    }

    override get Web3Others() {
        return new SolanaOthersAPI()
    }
}
