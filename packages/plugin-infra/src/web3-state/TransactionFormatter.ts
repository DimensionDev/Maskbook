import type { Web3Plugin } from '../entry-web3'

export class TransactionFormatterState<ChainId, TransactionParameter, Transaction>
    implements Web3Plugin.ObjectCapabilities.TransactionFormatterState<ChainId, TransactionParameter, Transaction>
{
    async format(chainId: ChainId, transaction: Transaction) {
        const context = await this.createContext(chainId, transaction)
        return this.createDescriptor(chainId, transaction, context)
    }
    createContext(
        chainId: ChainId,
        transaction: Transaction,
    ): Promise<Web3Plugin.TransactionContext<ChainId, TransactionParameter>> {
        throw new Error('Method not implemented.')
    }
    createDescriptor(
        chainId: ChainId,
        transaction: Transaction,
        context: Web3Plugin.TransactionContext<ChainId, TransactionParameter>,
    ): Promise<Web3Plugin.TransactionDescriptor<Transaction>> {
        throw new Error('Method not implemented.')
    }
}
