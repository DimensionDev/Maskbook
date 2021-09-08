import type { NonPayableTransactionObject, NonPayableTx } from '../../../web3-contracts/types/types'

export function safeNonPayableTransactionCall<T>(tx?: NonPayableTransactionObject<T>, overrides?: NonPayableTx) {
    try {
        if (!tx) return
        return tx.call(overrides)
    } catch (error) {
        return
    }
}
