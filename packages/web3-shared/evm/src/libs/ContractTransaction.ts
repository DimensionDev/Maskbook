import { identity, pickBy } from 'lodash-es'
import { toHex } from '@masknet/shared-base'
import type {
    PayableTx,
    NonPayableTransactionObject,
    PayableTransactionObject,
} from '@masknet/web3-contracts/types/types.js'
import type { Transaction } from '../types/index.js'

export class ContractTransaction {
    constructor(private contractAddress: string) {}

    static normalizeTransaction(transaction: Transaction): Transaction {
        const normalized: Transaction = { ...transaction }
        const { value, gas, gasPrice, maxPriorityFeePerGas, maxFeePerGas } = transaction
        if (value) normalized.value = toHex(value)
        if (gas) normalized.gas = toHex(gas)
        if (gasPrice) normalized.gasPrice = toHex(gasPrice)
        if (maxPriorityFeePerGas) normalized.maxPriorityFeePerGas = toHex(maxPriorityFeePerGas)
        if (maxFeePerGas) normalized.maxFeePerGas = toHex(maxFeePerGas)
        // drop all falsy fields
        return pickBy(normalized, identity)
    }

    /**
     * Fill the transaction include gas (for sending a payable transaction)
     * @param transaction
     * @param overrides
     * @returns
     */
    async fillAll(
        transaction: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown> | undefined,
        overrides?: Partial<Transaction>,
    ) {
        const transactionEncoded = ContractTransaction.normalizeTransaction({
            ...overrides,
            to: this.contractAddress,
            data: transaction?.encodeABI(),
        })

        // estimate gas
        if (!transactionEncoded.gas) {
            const gas = await transaction?.estimateGas({
                from: transactionEncoded.from,
                to: transactionEncoded.to,
                data: transactionEncoded.data,
                value: transactionEncoded.value,
            })

            if (!gas) throw new Error('Estimate gas failed')

            transactionEncoded.gas = toHex(gas)
        }

        return transactionEncoded
    }

    async send(
        transaction: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown> | undefined,
        overrides?: Partial<Transaction>,
    ) {
        const transactionEncoded = await this.fillAll(transaction, overrides)
        const receipt = await transaction?.send(transactionEncoded as PayableTx)
        return receipt?.transactionHash ?? ''
    }
}
