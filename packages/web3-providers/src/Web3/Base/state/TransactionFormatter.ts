import type {
    TransactionContext,
    TransactionDescriptor,
    TransactionFormatterState as Web3TransactionFormatterState,
} from '@masknet/web3-shared-base'

export abstract class TransactionFormatterState<ChainId, TransactionParameter, Transaction>
    implements Web3TransactionFormatterState<ChainId, TransactionParameter, Transaction>
{
    async formatTransaction(chainId: ChainId, transaction: Transaction, txHash?: string) {
        const context = await this.createContext(chainId, transaction, txHash)
        return this.createDescriptor(chainId, transaction, context)
    }
    abstract createContext(
        chainId: ChainId,
        transaction: Transaction,
        txHash?: string,
    ): Promise<TransactionContext<ChainId, TransactionParameter>>
    abstract createDescriptor(
        chainId: ChainId,
        transaction: Transaction,
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptor<ChainId, Transaction, TransactionParameter>>
}
