import type Web3 from 'web3'
import { AbiItem, toHex } from 'web3-utils'
import { identity, pickBy } from 'lodash-unified'
import type {
    BaseContract,
    NonPayableTransactionObject,
    PayableTransactionObject,
    PayableTx,
} from '@masknet/web3-contracts/types/types'
import type { Transaction } from '../types'
import { isValidAddress } from './address'

export function encodeTransaction(transaction: Transaction): PayableTx & {
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
} {
    return pickBy(
        {
            from: transaction?.from as string | undefined,
            to: transaction.to,
            value: transaction?.value ? toHex(transaction.value) : undefined,
            gas: transaction?.gas ? toHex(transaction.gas) : undefined,
            gasPrice: transaction?.gasPrice ? toHex(transaction.gasPrice) : undefined,
            maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas
                ? toHex(transaction.maxPriorityFeePerGas)
                : undefined,
            maxFeePerGas: transaction?.maxFeePerGas ? toHex(transaction.maxFeePerGas) : undefined,
            data: transaction.data,
            nonce: transaction?.nonce ? toHex(transaction.nonce) : undefined,
            chainId: transaction?.chainId ? toHex(transaction.chainId) : undefined,
        },
        identity,
    )
}

export async function encodeContractTransaction(
    contract: BaseContract,
    transaction: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>,
    overrides?: Partial<Transaction>,
) {
    const tx: PayableTx & {
        maxPriorityFeePerGas?: string
        maxFeePerGas?: string
    } = {
        from: (overrides?.from as string | undefined) ?? contract.defaultAccount ?? '',
        to: contract.options.address,
        data: transaction.encodeABI(),
        value: overrides?.value ? toHex(overrides.value) : undefined,
        gas: overrides?.gas ? toHex(overrides.gas) : undefined,
        gasPrice: overrides?.gasPrice ? toHex(overrides.gasPrice) : undefined,
        maxPriorityFeePerGas: overrides?.maxPriorityFeePerGas ? toHex(overrides.maxPriorityFeePerGas) : undefined,
        maxFeePerGas: overrides?.maxFeePerGas ? toHex(overrides.maxFeePerGas) : undefined,
        nonce: overrides?.nonce ? toHex(overrides.nonce) : undefined,
        chainId: overrides?.chainId ? toHex(overrides.chainId) : undefined,
    }

    if (!tx.gas) {
        tx.gas = await transaction.estimateGas({
            from: tx.from as string | undefined,
            to: tx.to as string | undefined,
            data: tx.data as string | undefined,
            value: tx.value,
        })
    }

    return encodeTransaction(tx)
}

export async function sendTransaction(
    contract: BaseContract | null,
    transaction?: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>,
    overrides?: Partial<Transaction>,
) {
    if (!contract || !transaction) throw new Error('Invalid contract or transaction.')
    const tx = await encodeContractTransaction(contract, transaction, overrides)
    const receipt = await transaction.send(tx as PayableTx)
    return receipt?.transactionHash ?? ''
}

export function createContract<T extends BaseContract>(web3: Web3 | null, address: string, ABI: AbiItem[]) {
    if (!address || !isValidAddress(address) || !web3) return null
    const contract = new web3.eth.Contract(ABI, address) as unknown as T
    return contract
}
