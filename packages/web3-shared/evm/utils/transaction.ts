import { unreachable } from '@dimensiondev/kit'
import { EthereumTransactionConfig, TransactionStateType } from '../types'

export function isEIP1559Transaction(receipt: EthereumTransactionConfig) {
    return typeof receipt.maxFeePerGas !== 'undefined' && typeof receipt.maxPriorityFeePerGas !== 'undefined'
}

export function isFinalState(type: TransactionStateType) {
    return [TransactionStateType.CONFIRMED, TransactionStateType.FAILED].includes(type)
}

/**
 * UNKNOWN -> WAIT_FOR_CONFIRMING
 * UNKNOWN, WAIT_FOR_CONFIRMING -> HASH
 * UNKNOWN, WAIT_FOR_CONFIRMING, HASH -> RECEIPT
 * WAIT_FOR_CONFIRMING, HASH, RECEIPT -> CONFIRMED
 * UNKNOWN, WAIT_FOR_CONFIRMING, HASH, RECEIPT -> FAILED
 * FAILED -> UNKNOWN
 */
export function isNextStateAvailable(type: TransactionStateType, nextType: TransactionStateType) {
    switch (nextType) {
        case TransactionStateType.UNKNOWN:
            return [TransactionStateType.FAILED].includes(type)
        case TransactionStateType.WAIT_FOR_CONFIRMING:
            return [TransactionStateType.UNKNOWN].includes(type)
        case TransactionStateType.HASH:
            return [TransactionStateType.UNKNOWN, TransactionStateType.WAIT_FOR_CONFIRMING].includes(type)
        case TransactionStateType.RECEIPT:
            return [
                TransactionStateType.UNKNOWN,
                TransactionStateType.WAIT_FOR_CONFIRMING,
                TransactionStateType.HASH,
            ].includes(type)
        case TransactionStateType.CONFIRMED:
            return [
                TransactionStateType.WAIT_FOR_CONFIRMING,
                TransactionStateType.HASH,
                TransactionStateType.RECEIPT,
            ].includes(type)
        case TransactionStateType.FAILED:
            return [
                TransactionStateType.UNKNOWN,
                TransactionStateType.WAIT_FOR_CONFIRMING,
                TransactionStateType.HASH,
                TransactionStateType.RECEIPT,
            ].includes(type)
        default:
            unreachable(nextType)
    }
}
