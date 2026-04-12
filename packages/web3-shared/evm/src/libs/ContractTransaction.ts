import { identity, pickBy } from 'lodash-es'
import { toHex } from '@masknet/shared-base'
import type {
    BaseContract,
    PayableTx,
    NonPayableTransactionObject,
    PayableTransactionObject,
} from '@masknet/web3-contracts/types/types.js'
import type { Transaction } from '../types/index.js'
import type { Hex } from 'viem'

export class ContractTransaction<T extends BaseContract | null> {
    constructor(private contract: T) {}

    /**
     * Fill the transaction without gas (for calling a readonly transaction)
     */
    private fill(
        transaction: Hex | PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown> | undefined,
        overrides: Partial<Transaction> | undefined,
    ): Transaction {
        return pickBy(
            {
                from: overrides?.from ?? this.contract?.defaultAccount ?? this.contract?.options.from ?? '',
                to: this.contract?.options.address,
                data: typeof transaction === 'string' ? transaction : transaction?.encodeABI(),
                value: overrides?.value ? toHex(overrides.value) : undefined,
                gas: overrides?.gas ? toHex(overrides.gas) : undefined,
                gasPrice: overrides?.gasPrice ? toHex(overrides.gasPrice) : undefined,
                maxPriorityFeePerGas:
                    overrides?.maxPriorityFeePerGas ? toHex(overrides.maxPriorityFeePerGas) : undefined,
                maxFeePerGas: overrides?.maxFeePerGas ? toHex(overrides.maxFeePerGas) : undefined,
                nonce: overrides?.nonce ? toHex(overrides.nonce) : undefined,
                chainId: overrides?.chainId ? toHex(overrides.chainId) : undefined,
            },
            identity,
        )
    }

    /**
     * Fill the transaction include gas (for sending a payable transaction)
     */
    async fillAll(
        transaction: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown> | undefined,
        overrides: Partial<Transaction> | undefined,
    ): Promise<Transaction> {
        const transactionEncoded = this.fill(transaction, overrides)

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

    async fillAllViem(
        transaction: Hex,
        estimateGas: (
            from: Hex | undefined,
            to: Hex | undefined,
            data: Hex | undefined,
            value: Hex | undefined,
        ) => Promise<bigint>,
        overrides: Partial<Transaction> | undefined,
    ): Promise<Transaction> {
        const transactionEncoded = this.fill(transaction, overrides)

        // estimate gas
        if (!transactionEncoded.gas) {
            const gas = await estimateGas(
                transactionEncoded.from as Hex,
                transactionEncoded.to as Hex,
                transactionEncoded.data as Hex,
                transactionEncoded.value as Hex,
            )

            if (!gas) throw new Error('Estimate gas failed')

            transactionEncoded.gas = toHex(gas)
        }

        return transactionEncoded
    }

    async send(
        transactionResolver: (
            e: T | undefined,
        ) => PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown> | undefined,
        overrides: Partial<Transaction> | undefined,
    ) {
        const transaction = transactionResolver(this.contract)
        const transactionEncoded = await this.fillAll(transaction, overrides)
        const receipt = await transaction?.send(transactionEncoded as PayableTx)
        return receipt?.transactionHash ?? ''
    }
}
