import type { Web3Plugin } from '@masknet/plugin-infra/src/entry-web3'
import type { ChainId, EthereumTransactionConfig } from '@masknet/web3-shared-evm'

export interface TransactionMethodABI {
    name: string
    parameters: {
        name: string
        type: string
    }[]
}

export interface TrabsactionComputationContext {
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
    /** acutal parameters */
    parameters?: {
        [key: string]: string | undefined
    }
}

export interface TransactionDescriptor {
    compute: (
        context: Web3Plugin.TransactionContext<ChainId, string | undefined>,
    ) => Promise<Omit<Web3Plugin.TransactionDescriptor<EthereumTransactionConfig>, 'type' | '_tx'> | undefined>
}
