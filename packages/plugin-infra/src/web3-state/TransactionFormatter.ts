import type { Plugin } from '../types'
import type {
    TransactionContext,
    TransactionDescriptor,
    TransactionFormatterState as Web3TransactionFormatterState,
} from '@masknet/web3-shared-base'

export class TransactionFormatterState<ChainId, TransactionParameter, Transaction>
    implements Web3TransactionFormatterState<ChainId, TransactionParameter, Transaction>
{
    constructor(context: Plugin.Shared.SharedContext) {}

    async formatTransaction(chainId: ChainId, transaction: Transaction) {
        const context = await this.createContext(chainId, transaction)
        return this.createDescriptor(chainId, transaction, context)
    }
    createContext(
        chainId: ChainId,
        transaction: Transaction,
    ): Promise<TransactionContext<ChainId, TransactionParameter>> {
        throw new Error('Method not implemented.')
    }
    createDescriptor(
        chainId: ChainId,
        transaction: Transaction,
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptor<ChainId, Transaction>> {
        throw new Error('Method not implemented.')
    }
}
