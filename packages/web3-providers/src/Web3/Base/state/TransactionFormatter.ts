import type { Plugin } from '@masknet/plugin-infra'
import type {
    TransactionContext,
    TransactionDescriptor,
    TransactionFormatterState as Web3TransactionFormatterState,
} from '@masknet/web3-shared-base'

export class TransactionFormatterState<ChainId, TransactionParameter, Transaction>
    implements Web3TransactionFormatterState<ChainId, TransactionParameter, Transaction>
{
    constructor(context: Plugin.Shared.SharedUIContext) {}

    async formatTransaction(chainId: ChainId, transaction: Transaction, txHash?: string) {
        const context = await this.createContext(chainId, transaction, txHash)
        return this.createDescriptor(chainId, transaction, context)
    }
    createContext(
        chainId: ChainId,
        transaction: Transaction,
        txHash?: string,
    ): Promise<TransactionContext<ChainId, TransactionParameter>> {
        throw new Error('Method not implemented.')
    }
    createDescriptor(
        chainId: ChainId,
        transaction: Transaction,
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptor<ChainId, Transaction, TransactionParameter>> {
        throw new Error('Method not implemented.')
    }
}
