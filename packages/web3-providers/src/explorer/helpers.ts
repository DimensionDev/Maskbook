import type { Transaction as Web3Transaction } from 'web3-core'
import type { Transaction } from './types'

export function toTransaction(transaction: Transaction): Web3Transaction & {
    status: '0' | '1'
    confirmations: number
} {
    return {
        status: transaction.txreceipt_status,
        blockHash: transaction.blockHash,
        blockNumber: Number.parseInt(transaction.blockNumber, 10),
        confirmations: Number.parseInt(transaction.confirmations, 10),
        from: transaction.from,
        to: transaction.to,
        gas: Number.parseInt(transaction.gas, 10),
        gasPrice: transaction.gasPrice,
        hash: transaction.hash,
        input: transaction.input,
        nonce: Number.parseInt(transaction.nonce, 10),
        transactionIndex: Number.parseInt(transaction.transactionIndex, 10),
        value: transaction.value,
    }
}
