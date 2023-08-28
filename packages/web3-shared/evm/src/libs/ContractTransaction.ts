import { identity, pickBy } from 'lodash-es'
import { toHex } from 'web3-utils'
import { type Unresolved, resolve } from '@masknet/shared-base'
import type {
    BaseContract,
    PayableTx,
    NonPayableTransactionObject,
    PayableTransactionObject,
} from '@masknet/web3-contracts/types/types.js'
import type { Transaction } from '../types/index.js'

type TransactionResolver<T extends BaseContract | null> = Unresolved<
    PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown> | undefined,
    T
>

export class ContractTransaction<T extends BaseContract | null> {
    constructor(private contract: T) {}

    /**
     * Fill the transaction without gas (for calling a readonly transaction)
     * @param transactionResolver
     * @param overrides
     * @returns
     */
    fill(transactionResolver: TransactionResolver<T>, overrides?: Partial<Transaction>): Transaction {
        const transaction = resolve(transactionResolver, this.contract)

        return pickBy(
            {
                from: overrides?.from ?? this.contract?.defaultAccount ?? this.contract?.options.from ?? '',
                to: this.contract?.options.address,
                data: transaction?.encodeABI(),
                value: overrides?.value ? toHex(overrides.value) : undefined,
                gas: overrides?.gas ? toHex(overrides.gas) : undefined,
                gasPrice: overrides?.gasPrice ? toHex(overrides.gasPrice) : undefined,
                maxPriorityFeePerGas: overrides?.maxPriorityFeePerGas
                    ? toHex(overrides.maxPriorityFeePerGas)
                    : undefined,
                maxFeePerGas: overrides?.maxFeePerGas ? toHex(overrides.maxFeePerGas) : undefined,
                nonce: overrides?.nonce ? toHex(overrides.nonce) : undefined,
                chainId: overrides?.chainId ? toHex(overrides.chainId) : undefined,
            },
            identity,
        )
    }

    /**
     * Fill the transaction include gas (for sending a payable transaction)
     * @param transactionResolver
     * @param overrides
     * @returns
     */
    async fillAll(transactionResolver: TransactionResolver<T>, overrides?: Partial<Transaction>) {
        const transaction = resolve(transactionResolver, this.contract)
        const transactionEncoded = this.fill(transactionResolver, overrides)

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

    async send(transactionResolver: TransactionResolver<T>, overrides?: Partial<Transaction>) {
        const transaction = resolve(transactionResolver, this.contract)
        const transactionEncoded = await this.fillAll(transactionResolver, overrides)
        const receipt = await transaction?.send(transactionEncoded as PayableTx)
        return receipt?.transactionHash ?? ''
    }
}
