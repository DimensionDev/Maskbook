import type { ChainId, Transaction } from '../types/index.js'

export class AccountTransaction {
    constructor(private chainId: ChainId, private transaction: Transaction) {}
}
