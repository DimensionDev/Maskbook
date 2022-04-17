import { first } from 'lodash-unified'
import { sha3 } from 'web3-utils'
import type { TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { EthereumMethodType, EthereumTransactionConfig, TransactionStatusType } from '../types'
import { isSameAddress } from './address'

export function createPayload(id: number, method: string, params: any[]) {
    return {
        id,
        jsonrpc: '2.0',
        method,
        params,
    }
}

export function getPayloadId(payload: JsonRpcPayload) {
    return typeof payload.id === 'string' ? Number.parseInt(payload.id, 10) : payload.id
}

export function getPayloadSignature(payload: JsonRpcPayload) {
    const config = getPayloadConfig(payload)
    if (!config) return
    const { from, to, data = '0x0', value = '0x0' } = config
    if (!from || !to) return
    return sha3([from, to, data, value].join('_')) ?? undefined
}

export function getPayloadFrom(payload: JsonRpcPayload): string | undefined {
    switch (payload.method) {
        case EthereumMethodType.ETH_SIGN:
            return first(payload.params)
        case EthereumMethodType.PERSONAL_SIGN:
            return payload.params?.[1]
        case EthereumMethodType.ETH_SIGN_TYPED_DATA:
            return first(payload.params)
        default:
            const config = getPayloadConfig(payload)
            return config?.from as string | undefined
    }
}

export function getPayloadTo(payload: JsonRpcPayload) {
    const config = getPayloadConfig(payload)
    return config?.to as string | undefined
}

export function getPayloadChainId(payload: JsonRpcPayload) {
    const config = getPayloadConfig(payload)
    return typeof config?.chainId === 'string' ? Number.parseInt(config.chainId, 16) || undefined : undefined
}

export function getPayloadConfig(payload: JsonRpcPayload) {
    switch (payload.method) {
        case EthereumMethodType.ETH_CALL:
        case EthereumMethodType.ETH_ESTIMATE_GAS:
        case EthereumMethodType.ETH_SIGN_TRANSACTION:
        case EthereumMethodType.ETH_SEND_TRANSACTION: {
            const [config] = payload.params as [EthereumTransactionConfig]
            return config
        }
        case EthereumMethodType.MASK_REPLACE_TRANSACTION: {
            const [, config] = payload.params as [string, EthereumTransactionConfig]
            return config
        }
        default:
            return
    }
}

export function getPayloadHash(payload: JsonRpcPayload) {
    switch (payload.method) {
        case EthereumMethodType.ETH_SEND_TRANSACTION: {
            return ''
        }
        case EthereumMethodType.MASK_REPLACE_TRANSACTION: {
            const [hash] = payload.params as [string]
            return hash
        }
        default:
            return ''
    }
}

export function getPayloadNonce(payload: JsonRpcPayload) {
    const config = getPayloadConfig(payload)
    return config?.nonce
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
