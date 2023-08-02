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
import { Web3StateRef } from './Web3StateAPI.js'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'

export class ChainResolverAPI extends ChainResolverAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    constructor() {
        super(Web3StateRef)
    }
}
