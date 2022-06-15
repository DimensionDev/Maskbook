import type Web3 from 'web3'
import { AbiItem, toHex } from 'web3-utils'
import { pick } from 'lodash-unified'
import type {
    BaseContract,
    NonPayableTransactionObject,
    PayableTransactionObject,
    PayableTx,
} from '@masknet/web3-contracts/types/types'
import type { Transaction } from '../types'
import { isValidAddress } from './address'

export async function encodeTransaction(
    contract: BaseContract,
    transaction: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>,
    overrides?: Partial<Transaction>,
) {
    const encoded: PayableTx & {
        maxPriorityFeePerGas?: string
        maxFeePerGas?: string
    } = {
        from: (overrides?.from as string) ?? contract.defaultAccount ?? undefined,
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

    if (!encoded.gas) {
        encoded.gas = await transaction.estimateGas(pick(encoded, ['from', 'value']))
    }

    return encoded
}

export async function sendTransaction(
    contract: BaseContract | null,
    transaction?: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>,
    overrides?: Partial<Transaction>,
) {
    if (!contract || !transaction) throw new Error('Invalid contract or transaction.')
    const tx = await encodeTransaction(contract, transaction, overrides)
    const receipt = await transaction.send(tx as PayableTx)
    return receipt?.transactionHash ?? ''
}

export function createContract<T extends BaseContract>(web3: Web3 | null, address: string, ABI: AbiItem[]) {
    if (!address || !isValidAddress(address) || !web3) return null
    const contract = new web3.eth.Contract(ABI, address) as unknown as T
    return contract
}
