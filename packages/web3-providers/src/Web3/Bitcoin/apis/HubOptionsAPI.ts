import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-bitcoin'
import { HubOptionsAPI_Base } from '../../Base/apis/HubOptionsAPI.js'
import { BitcoinOthersAPI } from './OthersAPI.js'
import { BitcoinWeb3StateRef } from './Web3StateAPI.js'

export class BitcoinHubOptionsAPI extends HubOptionsAPI_Base<
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
        return BitcoinWeb3StateRef
    }

    override get Web3Others() {
        return new BitcoinOthersAPI()
    }
}
