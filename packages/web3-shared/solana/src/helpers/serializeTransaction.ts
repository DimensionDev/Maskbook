import type { Transaction, VersionedTransaction } from '@solana/web3.js'

export function serializeTransaction(transaction: Transaction | VersionedTransaction) {
    if ('serializeMessage' in transaction) {
        return (transaction as Transaction).serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        })
    }
    return transaction.message.serialize()
}
