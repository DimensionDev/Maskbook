import type { Transaction } from './types'
import type { ExplorerAPI } from '..'

export function toTransaction(transaction: Transaction): ExplorerAPI.Transaction & {
    status: '0' | '1'
    confirmations: number
} {
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
        // cspell:ignore txreceipt
        status: transaction.txreceipt_status,
        confirmations: Number.parseInt(transaction.confirmations, 10),
    }
}
