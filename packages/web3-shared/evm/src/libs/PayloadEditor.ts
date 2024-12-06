import { first, isUndefined, omitBy } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { formatEthereumAddress } from '../helpers/formatter.js'
import { parseChainId } from '../helpers/parseChainId.js'
import { createJsonRpcPayload } from '../helpers/createJsonRpcPayload.js'
import {
    type Transaction,
    type TransactionOptions,
    type EIP3085Descriptor,
    EthereumMethodType,
} from '../types/index.js'
import { isReadonlyMethodType } from '../helpers/isReadonlyMethodType.js'
import { isRiskyMethodType } from '../helpers/isRiskyMethodType.js'

type Options = Pick<TransactionOptions, 'account' | 'chainId'>

export class PayloadEditor {
    constructor(
        private payload: JsonRpcPayload,
        private options?: Options,
    ) {}

    get pid() {
        const { id } = this.payload
        return typeof id === 'string' ? Number.parseInt(id, 10) : id
    }

    get method() {
        return this.payload.method
    }

    get params() {
        return this.payload.params ?? []
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
                return config.from
        }
    }

    get chainId() {
        return this.config.chainId ?? this.options?.chainId
    }

    get chainDescriptor() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN:
                const [descriptor] = params as [EIP3085Descriptor]
                return descriptor
            default:
                return null
        }
    }

    private getRawConfig() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.ETH_CALL:
            case EthereumMethodType.ETH_ESTIMATE_GAS:
            case EthereumMethodType.ETH_SIGN_TRANSACTION:
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                return (params as [Transaction])[0]
            default:
                return
        }
    }

    get config() {
        const raw = this.getRawConfig()

        return omitBy<Transaction>(
            {
                ...raw,
                nonce: parseHexNumber(raw?.nonce),
                from: raw?.from ?? this.options?.account,
                chainId: parseChainId(raw?.chainId) ?? this.options?.chainId,
            },
            isUndefined,
        )
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
                from: this.config.from ? formatEthereumAddress(this.config.from) : '',
                value: parseHexNumberString(this.config.value),
                gas: parseHexNumberString(this.config.gas),
                gasPrice: parseHexNumberString(this.config.gasPrice),
                maxFeePerGas: parseHexNumberString(this.config.maxFeePerGas),
                maxPriorityFeePerGas: parseHexNumberString(this.config.maxPriorityFeePerGas),
                // TODO: revert to parseHexNumberString after updating MaskCore
                chainId: parseHexNumber(this.config.chainId),
                nonce: parseHexNumberString(this.config.nonce),
            },
            isUndefined,
        ) as Transaction
    }

    get risky() {
        return isRiskyMethodType(this.payload.method as EthereumMethodType)
    }

    get readonly() {
        return isReadonlyMethodType(this.payload.method as EthereumMethodType)
    }

    fill() {
        return this.payload
    }

    static from<T>(id: number, method: EthereumMethodType, params: T[] = [], options?: Options) {
        return new PayloadEditor(
            createJsonRpcPayload(id, {
                method,
                params,
            }),
            options,
        )
    }

    static fromMethod<T>(method: EthereumMethodType, params: T[] = [], options?: Options) {
        return PayloadEditor.from(0, method, params, options)
    }

    static fromPayload(payload: JsonRpcPayload, options?: Options) {
        return new PayloadEditor(payload, options)
    }
}

function parseHexNumberString(hex: string | number | undefined) {
    return typeof hex !== 'undefined' ? web3_utils.hexToNumberString(hex ?? '0x0') : undefined
}

function parseHexNumber(hex: string | number | undefined) {
    return typeof hex !== 'undefined' ? (web3_utils.hexToNumber(hex) as number) : undefined
}
