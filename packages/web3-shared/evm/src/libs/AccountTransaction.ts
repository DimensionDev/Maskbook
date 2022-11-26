import { ZERO_ADDRESS } from '../constants/index.js'
import { isEmptyHex } from '../utils/address.js'
import type { ChainId, Transaction, UserOperation } from '../types/index.js'

export class AccountTransaction {
    constructor(private chainId: ChainId, private transaction: Transaction) {}

    get from() {
        const { from = '' } = this.transaction
        return from as string
    }

    get to() {
        const { to } = this.transaction
        if (!to) return ZERO_ADDRESS
        if (isEmptyHex(to)) return ZERO_ADDRESS
        return to
    }

    get value() {
        const { value = '0x0' } = this.transaction
        return value as string
    }

    get data() {
        const { data } = this.transaction
        if (!data) return
        if (isEmptyHex(data)) return
        if (!data.startsWith('0x')) return `0x${data}`
        return data
    }

    get functionSignature() {
        return this.data?.slice(0, 10)
    }

    get functionParameters() {
        return this.data?.slice(10)
    }

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
