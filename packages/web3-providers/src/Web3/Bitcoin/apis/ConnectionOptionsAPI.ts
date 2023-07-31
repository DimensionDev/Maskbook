import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-bitcoin'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { BitcoinOthersAPI } from './OthersAPI.js'
import { BitcoinWeb3StateRef } from './Web3StateAPI.js'

export class BitcoinConnectionOptionsAPI extends ConnectionOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
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
