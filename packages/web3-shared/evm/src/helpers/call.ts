import type { NonPayableTransactionObject, NonPayableTx } from '@masknet/web3-contracts/types/types.js'

export function safeNonPayableTransactionCall<T>(tx?: NonPayableTransactionObject<T>, overrides?: NonPayableTx) {
    try {
        if (!tx) return
        return tx.call(overrides)
    } catch (error) {
        return
    }
}
