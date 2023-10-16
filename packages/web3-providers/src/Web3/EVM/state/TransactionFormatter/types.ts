import type { TransactionContext, TransactionDescriptor as TransactionDescriptorBase } from '@masknet/web3-shared-base'
import type { ChainId, Transaction, TransactionParameter } from '@masknet/web3-shared-evm'

export interface TransactionMethodABI {
    name: string
    parameters: Array<{
        name: string
        type: string
    }>
}

export interface TransactionDescriptor {
    compute: (
        context: TransactionContext<ChainId, TransactionParameter>,
    ) => Promise<Omit<TransactionDescriptorBase<ChainId, Transaction>, 'type' | '_tx'> | undefined>
}
