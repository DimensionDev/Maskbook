import type { TransactionContext, TransactionDescriptor as TransactionDescriptorBase } from '@masknet/web3-shared-base'
import type { ChainId, Transaction, TransactionParameter } from '@masknet/web3-shared-evm'

export interface TransactionMethodABI {
    name: string
    parameters: Array<{
        name: string
        type: string
    }>
}

interface TransactionComputationContext {
    /** the from address. */
    from: string
    /** the to address */
    to: string
    /** the value amount (polyfill to 0x0 if absent in the original transaction) */
    value: string
    /** the data payload of transaction */
    data?: string
    /** code to deploy */
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
        context: TransactionContext<ChainId, TransactionParameter>,
    ) => Promise<Omit<TransactionDescriptorBase<ChainId, Transaction>, 'type' | '_tx'> | undefined>
}
