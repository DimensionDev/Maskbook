import type { ChainId, Transaction, UserOperation } from '../types/index.js'

export class AccountTransaction {
    constructor(private chainId: ChainId, private transaction?: Transaction) {}

    static fromUserOperation(chainId: ChainId, userOperation: UserOperation) {}

    static fromTransaction(chainId: ChainId, transaction: Transaction) {}

    static toUserOperation(transaction: Transaction): UserOperation {
        throw new Error('To be implemented.')
    }
}
