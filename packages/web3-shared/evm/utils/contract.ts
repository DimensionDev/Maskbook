import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import type {
    BaseContract,
    NonPayableTransactionObject,
    PayableTransactionObject,
    PayableTx,
} from '@masknet/web3-contracts/types/types'
import type { SendOptions } from 'web3-eth-contract'
import type { Transaction } from '../types'
import { isValidAddress } from './address'

export async function encodeTransaction(
    contract: BaseContract,
    transaction: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>,
    options?: SendOptions & {
        maxPriorityFeePerGas?: string
        maxFeePerGas?: string
    },
) {
    const encoded: Transaction = {
        from: contract.defaultAccount ?? undefined,
        to: contract.options.address,
        data: transaction.encodeABI(),
        ...options,
    }

    if (encoded.gas) {
        encoded.gas = await transaction.estimateGas(options)
    }

    return encoded
}

export async function sendTransaction(
    contract: BaseContract | null,
    transaction?: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>,
    overrides?: Partial<Transaction>,
) {
    if (!contract || !transaction) throw new Error('Invalid contract or transaction.')
    const tx = await encodeTransaction(contract, transaction)
    const receipt = await transaction.send({
        ...tx,
        ...overrides,
    } as PayableTx)
    return receipt?.transactionHash ?? ''
}

export function createContract<T extends BaseContract>(web3: Web3 | null, address: string, ABI: AbiItem[]) {
    if (!address || !isValidAddress(address) || !web3) return null
    const contract = new web3.eth.Contract(ABI, address) as unknown as T
    contract.transactionConfirmationBlocks = 0
    contract.transactionPollingTimeout = 10 * 1000
    return contract
}
