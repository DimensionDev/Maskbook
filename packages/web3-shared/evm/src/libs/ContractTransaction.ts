import { identity, pickBy } from 'lodash-es'
import { hexToNumber, toHex } from 'web3-utils'
import type {
    BaseContract,
    PayableTx,
    NonPayableTransactionObject,
    PayableTransactionObject,
} from '@masknet/web3-contracts/types/types.js'
import { ChainId, Transaction } from '../types/index.js'

type TransactionResolver<T extends BaseContract | null> =
    | PayableTransactionObject<unknown>
    | NonPayableTransactionObject<unknown>
    | ((contract: T) => PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown> | undefined)

export class ContractTransaction<T extends BaseContract | null> {
    constructor(private contract: T) {}

    private resolve(transactionResolver: TransactionResolver<T>) {
        if (typeof transactionResolver === 'function') return transactionResolver(this.contract)
        return transactionResolver
    }

    /**
     * Fill the transaction without gas (for calling a readonly transaction)
     * @param transactionResolver
     * @param overrides
     * @returns
     */
    fill(transactionResolver: TransactionResolver<T>, overrides?: Partial<Transaction>): Transaction {
        const transaction = this.resolve(transactionResolver)

        return pickBy(
            {
                from: overrides?.from ?? this.contract?.defaultAccount ?? '',
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
        const transaction = this.resolve(transactionResolver)
        const transactionEncoded = this.fill(transactionResolver, overrides)

        if (!transactionEncoded.gas) {
            try {
                const gas = await transaction?.estimateGas({
                    from: transactionEncoded.from,
                    to: transactionEncoded.to,
                    data: transactionEncoded.data,
                    value: transactionEncoded.value,
                    // rpc hack, alchemy rpc must pass gas parameter
                    gas: hexToNumber(overrides?.chainId ?? '0x0') === ChainId.Astar ? '0x135168' : undefined,
                })

                if (gas) {
                    transactionEncoded.gas = gas.toFixed()
                }
            } catch {
                // do nothing
            } finally {
                if (transactionEncoded.gas) {
                    transactionEncoded.gas = toHex(transactionEncoded.gas)
                }
            }
        }

        return transactionEncoded
    }

    async send(transactionResolver: TransactionResolver<T>, overrides?: Partial<Transaction>) {
        const transaction = this.resolve(transactionResolver)
        const transactionEncoded = await this.fillAll(transactionResolver, overrides)
        const receipt = await transaction?.send(transactionEncoded as PayableTx)
        return receipt?.transactionHash ?? ''
    }
}
