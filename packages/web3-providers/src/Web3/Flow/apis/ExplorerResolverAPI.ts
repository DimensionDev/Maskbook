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
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'

export class FlowExplorerResolverAPI extends ExplorerResolverAPI_Base<
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
        super(FlowWeb3StateRef, {
            addressPathname: '/account/:address',
            transactionPathname: '/transaction/:id',
            fungibleTokenPathname: '/contract/:address',
            nonFungibleTokenPathname: '/contract/:address',
        })
    }
}
