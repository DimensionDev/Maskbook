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
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'

export class ExplorerResolverAPI extends ExplorerResolverAPI_Base<
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
