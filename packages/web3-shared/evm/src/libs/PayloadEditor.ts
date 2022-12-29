import { first, isUndefined, omitBy } from 'lodash-es'
import { hexToNumber, hexToNumberString } from 'web3-utils'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { EthereumMethodType, Transaction, UserOperation } from '../types/index.js'
import { createJsonRpcPayload } from '../helpers/index.js'

const parseHexNumberString = (hex: string | number | undefined) =>
    typeof hex !== 'undefined' ? hexToNumberString(hex ?? '0x0') : undefined

const parseHexNumber = (hex: string | number | undefined) => (typeof hex !== 'undefined' ? hexToNumber(hex) : undefined)

export class PayloadEditor {
    constructor(private payload: JsonRpcPayload) {}

    get pid() {
        const { id } = this.payload
        return typeof id === 'string' ? Number.parseInt(id, 10) : id
    }

    get from(): string | undefined {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.ETH_SIGN:
                return first(params)
            case EthereumMethodType.PERSONAL_SIGN:
                return params?.[1]
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                return first(params)
            default:
                const config = this.config
                return config?.from
        }
    }

    get chainId() {
        return typeof this.config?.chainId === 'string'
            ? Number.parseInt(this.config.chainId, 16) || undefined
            : undefined
    }

    get config() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.ETH_CALL:
            case EthereumMethodType.ETH_ESTIMATE_GAS:
            case EthereumMethodType.ETH_SIGN_TRANSACTION:
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                return (params as [Transaction])[0]
            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                return (params as [string, Transaction])[1]
            default:
                return
        }
    }

    get userOperation() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.ETH_CALL_USER_OPERATION:
            case EthereumMethodType.ETH_SEND_USER_OPERATION:
                const [_, userOperation] = params as [string, UserOperation]
                return userOperation
            default:
                return
        }
    }

    get signableMessage() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.ETH_SIGN:
                return (params as [string, string])[1]
            case EthereumMethodType.PERSONAL_SIGN:
                return (params as [string, string])[0]
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                return (params as [string, string])[1]
            default:
                return
        }
    }

    get signableConfig() {
        if (!this.config) return

        return omitBy(
            {
                ...this.config,
                value: parseHexNumberString(this.config.value),
                gas: parseHexNumberString(this.config.gas),
                gasPrice: parseHexNumberString(this.config.gasPrice),
                maxFeePerGas: parseHexNumberString(this.config.maxFeePerGas),
                maxPriorityFeePerGas: parseHexNumberString(this.config.maxPriorityFeePerGas),
                // TODO: revert to parseHexNumberString after update MaskCore
                chainId: parseHexNumber(this.config.chainId),
                nonce: parseHexNumberString(this.config.nonce),
            },
            isUndefined,
        ) as Transaction
    }

    get risky() {
        const { method } = this.payload
        return [
            EthereumMethodType.ETH_SIGN,
            EthereumMethodType.PERSONAL_SIGN,
            EthereumMethodType.ETH_SIGN_TYPED_DATA,
            EthereumMethodType.ETH_DECRYPT,
            EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
            EthereumMethodType.ETH_SEND_TRANSACTION,
            EthereumMethodType.MASK_REPLACE_TRANSACTION,
        ].includes(method as EthereumMethodType)
    }

    get readonly() {
        const { method } = this.payload
        return [
            EthereumMethodType.ETH_GET_CODE,
            EthereumMethodType.ETH_GAS_PRICE,
            EthereumMethodType.ETH_BLOCK_NUMBER,
            EthereumMethodType.ETH_GET_BALANCE,
            EthereumMethodType.ETH_GET_BLOCK_BY_NUMBER,
            EthereumMethodType.ETH_GET_BLOCK_BY_HASH,
            EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
            EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
            EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
            EthereumMethodType.ETH_GET_FILTER_CHANGES,
            EthereumMethodType.ETH_NEW_PENDING_TRANSACTION_FILTER,
            EthereumMethodType.ETH_ESTIMATE_GAS,
            EthereumMethodType.ETH_CALL,
            EthereumMethodType.ETH_GET_LOGS,
        ].includes(method as EthereumMethodType)
    }

    fill() {
        return this.payload
    }

    static from<T extends unknown>(id: number, method: string, params: T[] = []) {
        return new PayloadEditor(
            createJsonRpcPayload(id, {
                method,
                params,
            }),
        )
    }

    static fromMethod<T extends unknown>(method: string, params: T[] = []) {
        return PayloadEditor.from(0, method, params)
    }

    static fromPayload(payload: JsonRpcPayload) {
        return new PayloadEditor(payload)
    }
}
