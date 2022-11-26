import { identity, pickBy } from 'lodash-es'
import { toHex } from 'web3-utils'
import type {
    BaseContract,
    NonPayableTransactionObject,
    PayableTransactionObject,
} from '@masknet/web3-contracts/types/types.js'
import { ZERO_ADDRESS } from '../constants/index.js'
import { isEmptyHex } from '../utils/address.js'
import type { ChainId, Transaction, UserOperation } from '../types/index.js'

export class AccountTransaction {
    constructor(private transaction?: Transaction) {}

    private resolveContractTransaction<T extends BaseContract | null>(
        contract: T,
        resolver:
            | PayableTransactionObject<unknown>
            | NonPayableTransactionObject<unknown>
            | ((contract: T) => PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>),
    ) {
        if (typeof resolver === 'function') return resolver(contract)
        return resolver
    }

    get from() {
        const from = this.transaction?.from ?? ''
        return from as string
    }

    get to() {
        const to = this.transaction?.to
        if (!to) return ZERO_ADDRESS
        if (isEmptyHex(to)) return ZERO_ADDRESS
        return to
    }

    get value() {
        const value = this.transaction?.value ?? '0x0'
        return value as string
    }

    get data() {
        const data = this.transaction?.data
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

    encodeTransaction(overrides?: Transaction): Transaction {
        const { chainId, from, to, value, gas, gasPrice, maxPriorityFeePerGas, maxFeePerGas, data, nonce } = {
            ...this.transaction,
            ...overrides,
        }
        return pickBy(
            {
                from: from as string | undefined,
                to,
                data,
                value: value ? toHex(value) : undefined,
                chainId: chainId ? toHex(chainId) : undefined,
                gas: gas ? toHex(gas) : undefined,
                gasPrice: gasPrice ? toHex(gasPrice) : undefined,
                maxPriorityFeePerGas: maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : undefined,
                maxFeePerGas: maxFeePerGas ? toHex(maxFeePerGas) : undefined,
                nonce: nonce ? toHex(nonce) : undefined,
            },
            identity,
        )
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
