import { sha3 } from 'web3-utils'
import type { Transaction, TransactionConfig, TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import {
    isSameAddress,
    TransactionState,
    TransactionStateType,
    TransactionStatusType,
    EthereumMethodType,
} from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'

export function getPayloadId(payload: JsonRpcPayload) {
    if (!payload.id || payload.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return ''
    const [config] = payload.params as [TransactionConfig]
    const { from, to, gas, data = '0x0', value = '0x0' } = config
    if (!from || !to || !gas) return ''
    return sha3([from, to, gas, data, value].join('_')) ?? ''
}

export function getTransactionId(transaction: Transaction | null) {
    if (!transaction) return ''
    const { from, to, gas, input, value } = transaction
    return sha3([from, to, gas, input || '0x0', value || '0x0'].join('_')) ?? ''
}

export function getReceiptStatus(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status as unknown as string
    if (receipt.status === false || ['0x', '0x0'].includes(status)) return TransactionStatusType.FAILED
    if (receipt.status === true || ['0x1'].includes(status)) {
        if (isSameAddress(receipt.from, receipt.to)) return TransactionStatusType.CANCELLED
        return TransactionStatusType.SUCCEED
    }
    return TransactionStatusType.NOT_DEPEND
}

export function getTransactionHash(state?: TransactionState) {
    if (!state) return ''
    switch (state?.type) {
        case TransactionStateType.HASH:
            return state.hash
        case TransactionStateType.RECEIPT:
            return state.receipt.transactionHash
        case TransactionStateType.CONFIRMED:
            return state.receipt.transactionHash
        case TransactionStateType.FAILED:
            return state.receipt?.transactionHash ?? ''
        default:
            return ''
    }
}

export function getTransactionState(receipt: TransactionReceipt): TransactionState {
    if (receipt.blockNumber) {
        const status = getReceiptStatus(receipt)
        switch (status) {
            case TransactionStatusType.SUCCEED:
                return {
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                }
            case TransactionStatusType.FAILED:
                return {
                    type: TransactionStateType.FAILED,
                    receipt,
                    error: new Error('FAILED'),
                }
            case TransactionStatusType.NOT_DEPEND:
                return {
                    type: TransactionStateType.FAILED,
                    receipt,
                    error: new Error('Invalid transaction status.'),
                }
            case TransactionStatusType.CANCELLED:
                return {
                    type: TransactionStateType.FAILED,
                    receipt,
                    error: new Error('CANCELLED'),
                }
            default:
                unreachable(status)
        }
    }
    return {
        type: TransactionStateType.RECEIPT,
        receipt,
    }
}
