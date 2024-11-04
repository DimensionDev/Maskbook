import { first, isUndefined, omitBy } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { AbiItem } from 'web3-utils'
import type { JsonRpcPayload } from 'web3-core-helpers'
import type { Wallet, ECKeyIdentifier, Proof, ProofPayload } from '@masknet/shared-base'
import CREATE2_FACTORY_ABI from '@masknet/web3-contracts/abis/Create2Factory.json' with { type: 'json' }
import { isValidChainId } from '../helpers/isValidChainId.js'
import { formatEthereumAddress } from '../helpers/formatter.js'
import { parseChainId } from '../helpers/parseChainId.js'
import { createJsonRpcPayload } from '../helpers/createJsonRpcPayload.js'
import { ZERO_ADDRESS, getSmartPayConstant } from '../constants/index.js'
import {
    type Transaction,
    type TransactionOptions,
    type UserOperation,
    type EIP3085Descriptor,
    EthereumMethodType,
} from '../types/index.js'
import { abiCoder } from '../helpers/abiCoder.js'
import { readonlyMethodType } from '../helpers/isReadonlyMethodType.js'
import { riskyMethodType } from '../helpers/isRiskyMethodType.js'
import { gasConsumingMethodType } from '../helpers/isGasConsumingMethodType.js'

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

    get from(): string | undefined {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.eth_sign:
                return first(params)
            case EthereumMethodType.personal_sign:
                return params?.[1]
            case EthereumMethodType.eth_signTypedData_v4:
                return first(params)
            default:
                const config = this.config
                return config.from
        }
    }

    get owner() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.MASK_FUND:
                const [proof] = params as [Proof]
                const { ownerAddress } = JSON.parse(proof.payload) as ProofPayload
                return ownerAddress
            case EthereumMethodType.MASK_DEPLOY:
                const [owner] = params as [string, ECKeyIdentifier]
                return owner
            default:
                return
        }
    }

    get identifier() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.MASK_DEPLOY:
                const [_, identifier] = params as [string, ECKeyIdentifier]
                return identifier
            default:
                return
        }
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
            case EthereumMethodType.MASK_DEPLOY: {
                const chainId = this.options?.chainId
                if (!isValidChainId(chainId)) throw new Error('Unknown chain id.')

                const [owner] = params as [string]

                // compose a fake transaction to be accepted by Transaction Watcher

                return {
                    from: owner,
                    to: getSmartPayConstant(chainId, 'CREATE2_FACTORY_CONTRACT_ADDRESS'),
                    chainId,
                    data: abiCoder.encodeFunctionCall(
                        CREATE2_FACTORY_ABI.find((x) => x.name === 'deploy')! as AbiItem,
                        ['0x', web3_utils.toHex(0)],
                    ),
                }
            }
            case EthereumMethodType.MASK_FUND: {
                const chainId = this.options?.chainId
                if (!isValidChainId(chainId)) throw new Error('Unknown chain id.')

                const [proof] = params as [Proof]
                const { ownerAddress, nonce = 0 } = JSON.parse(proof.payload) as ProofPayload

                // compose a fake transaction to be accepted by Transaction Watcher
                return {
                    from: ownerAddress,
                    // it's a not-exist address, use the zero address as a placeholder
                    to: ZERO_ADDRESS,
                    chainId,
                    data: abiCoder.encodeFunctionCall(CREATE2_FACTORY_ABI.find((x) => x.name === 'fund')! as AbiItem, [
                        ownerAddress,
                        web3_utils.toHex(nonce),
                    ]),
                }
            }
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

    get userOperation() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.eth_callUserOperation:
            case EthereumMethodType.eth_sendUserOperation:
                const [_, userOperation] = params as [string, UserOperation]
                return userOperation
            default:
                return
        }
    }

    get proof() {
        const { method, params } = this.payload
        switch (method) {
            case EthereumMethodType.MASK_FUND:
                return (params as [Proof])[0]
            default:
                return
        }
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
