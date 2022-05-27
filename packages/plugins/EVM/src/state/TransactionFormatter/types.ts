import type { TransactionContext, TransactionDescriptor as TransactionDescriptorBase } from '@masknet/web3-shared-base'
import type { ChainId, Transaction } from '@masknet/web3-shared-evm'

export interface TransactionMethodABI {
    name: string
    parameters: Array<{
        name: string
        type: string
    }>
}

export interface TransactionComputationContext {
    /** the from address. */
    from: string
    /** the to address */
    to: string
    /** the value amount (polyfill to 0x0 if absent in the original transaction) */
    value: string
    /** the data paylaod of transaction */
    data?: string
    /** code to depoly */
    code?: string
    /** method name */
    name?: string
    /** actual parameters */
    parameters?: {
        [key: string]: string | undefined
    }
}

export interface TransactionDescriptor {
    compute: (
        context: TransactionContext<ChainId, string | undefined>,
    ) => Promise<Omit<TransactionDescriptorBase<ChainId, Transaction>, 'type' | '_tx'> | undefined>
}
