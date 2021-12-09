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

export function toReceipt(status: '0' | '1', transaction: Transaction): TransactionReceipt {
    return {
        status: status === '1',
        transactionHash: transaction.hash,
        transactionIndex: transaction.transactionIndex ?? 0,
        blockHash: transaction.blockHash ?? '',
        blockNumber: transaction.blockNumber ?? 0,
        from: transaction.from,
        to: transaction.to ?? '',
        cumulativeGasUsed: 0,
        gasUsed: 0,
        logs: [],
        logsBloom: '',
    }
}

export function getPayloadConfig(payload: JsonRpcPayload) {
    if (!payload.id || payload.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return
    const [config] = payload.params as [TransactionConfig]
    return config
}

export function getPayloadId(payload: JsonRpcPayload) {
    const config = getPayloadConfig(payload)
    if (!config) return ''
    const { from, to, data = '0x0', value = '0x0' } = config
    if (!from || !to) return ''
    return sha3([from, to, data, value].join('_')) ?? ''
}

export function getTransactionId(transaction: Transaction | null) {
    if (!transaction) return ''
    const { from, to, input, value } = transaction
    return sha3([from, to, input || '0x0', value || '0x0'].join('_')) ?? ''
}

export function getReceiptStatus(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status as unknown as string
    if (receipt.status === false || ['0', '0x', '0x0'].includes(status)) return TransactionStatusType.FAILED
    if (receipt.status === true || ['1', '0x1'].includes(status)) {
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
