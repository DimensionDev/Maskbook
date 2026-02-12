import type { TransactionContext, FormattedTransaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction, TransactionParameter } from '@masknet/web3-shared-evm'
import type { AbiParameter } from 'abitype'

export interface TransactionMethodABI {
    name: string
    parameters: readonly AbiParameter[]
}

export type TransactionDescriptorFormatResult = FormattedTransaction<ChainId, Transaction>
export interface TransactionDescriptorFormatter {
    compute(
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined>
}
