import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { omit } from 'lodash-unified'
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
    const encoded: Transaction = {
        from: contract.defaultAccount ?? undefined,
        to: contract.options.address,
        data: transaction.encodeABI(),
        ...omit(overrides, 'chainId'),
    }

    if (!encoded.gas) {
        encoded.gas = await transaction.estimateGas(overrides as PayableTx)
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
