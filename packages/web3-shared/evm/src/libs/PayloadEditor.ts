import { first, isUndefined, omitBy } from 'lodash-es'
import { hexToNumber, hexToNumberString } from 'web3-utils'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { EthereumMethodType, Transaction, UserOperation } from '../types/index.js'

const parseHexNumberString = (hex: string | number | undefined) =>
    typeof hex !== 'undefined' ? hexToNumberString(hex ?? '0x0') : undefined

const parseHexNumber = (hex: string | number | undefined) => (typeof hex !== 'undefined' ? hexToNumber(hex) : undefined)

export class PayloadEditor {
    constructor(private payload: JsonRpcPayload) {}

    get pid() {
        const { id } = this.payload
        return typeof id === 'string' ? Number.parseInt(id, 10) : id
    }

    get from() {
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
            case EthereumMethodType.ETH_SEND_TRANSACTION: {
                const [config] = params as [Transaction]
                return config
            }
            case EthereumMethodType.MASK_REPLACE_TRANSACTION: {
                const [, config] = params as [string, Transaction]
                return config
            }
            default:
                return
        }
    }

    get userOperation() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.ETH_SEND_USER_OPERATION:
                const [userOperation] = params as [UserOperation]
                return userOperation
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

    get isRisk() {
        const { method } = this.payload
        return [
            EthereumMethodType.ETH_SIGN,
            EthereumMethodType.PERSONAL_SIGN,
            EthereumMethodType.ETH_SIGN_TYPED_DATA,
            EthereumMethodType.ETH_DECRYPT,
            EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
            EthereumMethodType.ETH_SEND_TRANSACTION,
        ].includes(method as EthereumMethodType)
    }

    fill() {
        return this.payload
    }

    static from<T extends unknown>(id: number, method: string, params: T[] = []) {
        return new PayloadEditor({
            id,
            jsonrpc: '2.0',
            method,
            params,
        })
    }

    static fromMethod<T extends unknown>(method: string, params: T[] = []) {
        return PayloadEditor.from(0, method, params)
    }

    static fromPayload(payload: JsonRpcPayload) {
        return new PayloadEditor(payload)
    }
}
