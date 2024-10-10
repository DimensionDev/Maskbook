import type { Transaction } from './types.js'
import type { ExplorerAPI } from '../entry-types.js'

export function toTransaction(transaction: Transaction): ExplorerAPI.Transaction {
    return {
        nonce: Number.parseInt(transaction.nonce, 10),
        blockHash: transaction.blockHash,
        blockNumber: Number.parseInt(transaction.blockNumber, 10),
        from: transaction.from,
        to: transaction.to,
        gas: Number.parseInt(transaction.gas, 10),
        gasPrice: transaction.gasPrice,
        hash: transaction.hash,
        input: transaction.input,
        transactionIndex: Number.parseInt(transaction.transactionIndex, 10),
        value: transaction.value,
        // cspell:disable-next-line
        status: transaction.txreceipt_status,
        confirmations: Number.parseInt(transaction.confirmations, 10),
    }
}
