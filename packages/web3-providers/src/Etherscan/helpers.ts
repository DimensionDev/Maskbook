import type { Transaction } from './types.js'
import type { ExplorerAPI } from '../entry-types.js'
import type { Address, Hash, Hex } from 'viem'

export function toTransaction(transaction: Transaction): ExplorerAPI.Transaction {
    return {
        nonce: Number.parseInt(transaction.nonce, 10),
        blockHash: transaction.blockHash as Hash,
        blockNumber: BigInt(transaction.blockNumber),
        from: transaction.from as Address,
        to: transaction.to ? (transaction.to as Address) : null,
        gas: BigInt(transaction.gas),
        gasPrice: BigInt(transaction.gasPrice),
        hash: transaction.hash as Hash,
        input: transaction.input as Hex,
        transactionIndex: Number.parseInt(transaction.transactionIndex, 10),
        value: BigInt(transaction.value),
        // cspell:disable-next-line
        status: transaction.txreceipt_status,
        confirmations: Number.parseInt(transaction.confirmations, 10),
    }
}
