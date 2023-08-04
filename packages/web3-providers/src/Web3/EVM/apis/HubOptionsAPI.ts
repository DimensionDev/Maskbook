import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-evm'
import { HubOptionsAPI_Base } from '../../Base/apis/HubOptionsAPI.js'
import { Web3StateRef } from './Web3StateAPI.js'
import { OthersAPI } from './OthersAPI.js'

export class HubOptionsAPI extends HubOptionsAPI_Base<
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
        return Web3StateRef
    }

    override get Web3Others() {
        return new OthersAPI()
    }
}
