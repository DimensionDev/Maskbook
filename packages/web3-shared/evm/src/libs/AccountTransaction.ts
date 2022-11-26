import type { ChainId, Transaction, UserOperation } from '../types/index.js'

export class AccountTransaction {
    constructor(private chainId: ChainId, private transaction?: Transaction) {}

    static fromUserOperation(chainId: ChainId, userOperation: UserOperation) {
        throw new Error('To be implemented.')
    }

    static fromTransaction(chainId: ChainId, transaction: Transaction) {
        throw new Error('To be implemented.')
    }

    static toUserOperation(transaction: Transaction): UserOperation {
        throw new Error('To be implemented.')
    }
}
