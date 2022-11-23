import type { ChainId, Transaction, UserOperation } from '../types/index.js'

export class AccountTransaction {
    constructor(private chainId: ChainId, private transaction?: Transaction) {}

    static to(transaction?: Transaction): UserOperation {
        throw new Error('To be implemented.')
    }
}
