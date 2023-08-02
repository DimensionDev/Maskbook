import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-Solana'
import { SolanaWeb3StateRef } from './Web3StateAPI.js'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'

export class SolanaChainResolverAPI extends ChainResolverAPI_Base<
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
        super(SolanaWeb3StateRef)
    }
}
