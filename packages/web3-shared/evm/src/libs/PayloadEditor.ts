import { first, isUndefined, omitBy } from 'lodash-es'
import defer * as web3_utils from 'web3-utils'
import type { JsonRpcRequest } from 'web3-types'
import type { Wallet } from '@masknet/shared-base'
import { formatEthereumAddress } from '../helpers/formatter.js'
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
            default:
                const config = this.config
                return config.from
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
            case EthereumMethodType.wallet_addEthereumChain:
                const [descriptor] = params as [EIP3085Descriptor]
                return descriptor
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
                nonce: parseHexNumber(raw?.nonce),
                from: raw?.from ?? this.options?.account,
                chainId: parseChainId(raw?.chainId) ?? this.options?.chainId,
            },
            isUndefined,
        )
    }

    get wallet() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.MASK_ADD_WALLET:
                const [wallet] = params as [Wallet]
                return wallet
            default:
                return
        }
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

    static from<T>(id: number, method: EthereumMethodType, params: T[] = [], options?: Options) {
        return new PayloadEditor(
            createJsonRpcRequest(id, {
                method,
                params,
            }),
            options,
        )
    }

    static fromMethod<T>(method: EthereumMethodType, params: T[] = [], options?: Options) {
        return PayloadEditor.from(0, method, params, options)
    }

    static fromPayload(payload: JsonRpcRequest, options?: Options) {
        return new PayloadEditor(payload, options)
    }
}

function parseHexNumberString(hex: string | number | undefined) {
    return typeof hex !== 'undefined' ? web3_utils.hexToNumberString(hex ?? '0x0') : undefined
}

function parseHexNumber(hex: string | number | undefined) {
    return typeof hex !== 'undefined' ? (web3_utils.hexToNumber(hex) as number) : undefined
}
