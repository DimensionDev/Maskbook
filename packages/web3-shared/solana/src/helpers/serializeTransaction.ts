import type { Transaction, VersionedTransaction } from '@solana/web3.js'

export function serializeTransaction(transaction: Transaction | VersionedTransaction) {
    // legacy transaction
    if ('serializeMessage' in transaction) {
        return (transaction as Transaction).serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        })
    }

    // versioned transaction
    return transaction.serialize()
}
