import type { Transaction, VersionedTransaction } from '@solana/web3.js'

export function serializeTransaction(transaction: Transaction | VersionedTransaction) {
    if ('serializeMessage' in transaction) {
        return transaction.serializeMessage()
    }
    return transaction.message.serialize()
}
