import { first, isUndefined, omitBy } from 'lodash-es'
import type { JsonRpcRequest } from '@masknet/web3-shared-base'
import { parseChainId } from '../helpers/parseChainId.js'
import { createJsonRpcRequest } from '../helpers/createJsonRpcRequest.js'
import {
    type Transaction,
    type TransactionOptions,
    type EIP3085Descriptor,
    EthereumMethodType,
} from '../types/index.js'
import { readonlyMethodType } from '../helpers/isReadonlyMethodType.js'
import { riskyMethodType } from '../helpers/isRiskyMethodType.js'
import { gasConsumingMethodType } from '../helpers/isGasConsumingMethodType.js'
import { hexToBigInt, hexToNumber, isHex, type Hex, type TransactionSerializable } from 'viem'

type Options = Pick<TransactionOptions, 'account' | 'chainId'>

export class PayloadEditor {
    constructor(
        private payload: JsonRpcRequest,
        private options?: Options,
    ) {}

    get pid() {
        const { id } = this.payload
        return typeof id === 'string' ? Number.parseInt(id, 10) : id
    }

    get method() {
        return this.payload.method
    }

    get from(): string | undefined {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.eth_sign:
                return String(first(params))
            case EthereumMethodType.personal_sign:
                return String(params?.[1])
            case EthereumMethodType.eth_signTypedData_v4:
                return String(first(params))
            default: {
                const config = this.config
                return config.from
            }
        }
    }

    get identifier() {
        return
    }

    get chainId() {
        return this.config.chainId ?? this.options?.chainId
    }

    get chainDescriptor() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.wallet_addEthereumChain: {
                const [descriptor] = params as [EIP3085Descriptor]
                return descriptor
            }
            default:
                return null
        }
    }

    private getRawConfig() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.eth_call:
            case EthereumMethodType.eth_estimateGas:
            case EthereumMethodType.eth_signTransaction:
            case EthereumMethodType.eth_sendTransaction:
                return (params as [Transaction])[0]
            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                return (params as [string, Transaction])[1]
            default:
                return
        }
    }

    get config() {
        const raw = this.getRawConfig()

        return omitBy<Transaction>(
            {
                ...raw,
                nonce: toNumber(raw?.nonce),
                from: raw?.from ?? this.options?.account,
                chainId: parseChainId(raw?.chainId) ?? this.options?.chainId,
            },
            isUndefined,
        )
    }

    get proof() {
        return
    }

    get signableMessage() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.eth_sign:
                return (params as [string, string])[1]
            case EthereumMethodType.personal_sign:
                return (params as [string, string])[0]
            case EthereumMethodType.eth_signTypedData_v4:
                return (params as [string, string])[1]
            default:
                return
        }
    }

    get signableTransaction(): TransactionSerializable | undefined {
        if (!this.config) return

        const tx = {
            ...this.config,
            type:
                this.config.type === '0x0' ? 'legacy'
                : this.config.type === '0x1' ? 'eip2930'
                : this.config.type === '0x2' ? 'eip1559'
                : undefined,
            to: this.config.to as Hex,
            data: this.config.data as Hex,
            value: toBigInt(this.config.value),
            gas: toBigInt(this.config.gas),
            gasPrice: toBigInt(this.config.gasPrice),
            maxFeePerGas: toBigInt(this.config.maxFeePerGas),
            maxPriorityFeePerGas: toBigInt(this.config.maxPriorityFeePerGas),
            chainId: toNumber(this.config.chainId),
            nonce: toNumber(this.config.nonce),
        } as TransactionSerializable
        return omitBy(tx, isUndefined)
    }

    get risky() {
        return (riskyMethodType as readonly string[]).includes(this.payload.method)
    }

    get readonly() {
        return (readonlyMethodType as readonly string[]).includes(this.payload.method)
    }

    get gasConsuming() {
        return (gasConsumingMethodType as readonly string[]).includes(this.payload.method)
    }

    fill() {
        return this.payload
    }

    static from(id: number, method: EthereumMethodType, params: unknown[] = [], options?: Options) {
        return new PayloadEditor(
            createJsonRpcRequest(id, {
                method,
                params,
            }),
            options,
        )
    }

    static fromMethod(method: EthereumMethodType, params: unknown[] = [], options?: Options) {
        return this.from(0, method, params, options)
    }

    static fromPayload(payload: JsonRpcRequest, options?: Options) {
        return new PayloadEditor(payload, options)
    }
}

function toBigInt(hex: string | number | undefined) {
    if (typeof hex === 'number') return BigInt(hex)
    if (typeof hex === 'string') {
        if (isHex(hex)) return hexToBigInt(hex)
        return BigInt(hex)
    }
    return
}

function toNumber(hex: string | number | undefined) {
    if (typeof hex === 'number') return hex
    if (typeof hex === 'string') {
        if (isHex(hex)) return Number(hexToNumber(hex))
        return Number(hex)
    }
    return
}
