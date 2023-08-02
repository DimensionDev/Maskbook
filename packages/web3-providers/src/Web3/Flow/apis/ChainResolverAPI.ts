import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { FlowWeb3StateRef } from './Web3StateAPI.js'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'

export class FlowChainResolverAPI extends ChainResolverAPI_Base<
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
        super(FlowWeb3StateRef)
    }
}
