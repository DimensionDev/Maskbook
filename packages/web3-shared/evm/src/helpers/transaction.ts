import type Web3 from 'web3'
import { type AbiItem, sha3, toHex } from 'web3-utils'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import { isValidAddress } from './address.js'
import type { Transaction, ChainId, TransactionReceipt } from '../types/index.js'

export function createContract<T extends BaseContract>(web3: Web3 | null, address: string, ABI: AbiItem[]) {
    if (!address || !isValidAddress(address) || !web3) return null
    const contract = new web3.eth.Contract(ABI, address) as unknown as T
    return contract
}

export function getTransactionSignature(chainId?: ChainId, transaction?: Partial<Transaction>) {
    if (!chainId || !transaction) return
    const { from, to, data, value } = transaction
    return sha3([chainId, from, to, data || '0x0', toHex((value as string) || '0x0') || '0x0'].join('_')) ?? undefined
}

export function getTransactionStatusType(receipt: TransactionReceipt) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status as unknown as string
    if (receipt.status === false || ['0', '0x', '0x0'].includes(status)) return TransactionStatusType.FAILED
    if (receipt.status === true || ['1', '0x1'].includes(status)) return TransactionStatusType.SUCCEED
    return TransactionStatusType.NOT_DEPEND
}
