import { first } from 'lodash-unified'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { EthereumMethodType, EthereumTransactionConfig } from '../types'

export function getPayloadChainId(payload: JsonRpcPayload) {
    switch (payload.method) {
        // here are methods that contracts may emit
        case EthereumMethodType.ETH_CALL:
        case EthereumMethodType.ETH_ESTIMATE_GAS:
        case EthereumMethodType.ETH_SEND_TRANSACTION:
            const config = first(payload.params) as { chainId?: string } | undefined
            return typeof config?.chainId === 'string' ? Number.parseInt(config.chainId, 16) || undefined : undefined
        default:
            return
    }
}

export function getPayloadConfig(payload: JsonRpcPayload) {
    switch (payload.method) {
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

export function getTransactionHash(response?: JsonRpcResponse) {
    if (!response) return ''
    const hash = response?.result as string | undefined
    if (typeof hash !== 'string') return ''
    if (!/^0x([\dA-Fa-f]{64})$/.test(hash)) return ''
    return hash
}
