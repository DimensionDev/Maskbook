import { sha3 } from 'web3-utils'
import type { TransactionConfig } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { EthereumMethodType, type RequestArguments } from '../types/index.js'

export class RequestID {
    /**
     * @deprecated Don't new RequestID()
     * Use RequestID.from(requestArguments) stead.
     */
    constructor(
        private url: string,
        private requestArguments: RequestArguments,
    ) {}

    get ID() {
        const { method, params } = this.requestArguments
        switch (method) {
            case EthereumMethodType.ETH_GET_CODE: {
                const [address, tag = 'latest'] = params as [string, string]
                return sha3([this.url, method, address, tag].join(','))
            }
            case EthereumMethodType.ETH_BLOCK_NUMBER: {
                return sha3([this.url, method].join(','))
            }
            case EthereumMethodType.ETH_GET_BLOCK_BY_NUMBER: {
                const [number, full] = params as [string, boolean]
                return sha3([this.url, method, number, full].join(','))
            }
            case EthereumMethodType.ETH_GET_BLOCK_BY_HASH: {
                const [hash] = params as [string]
                return sha3([this.url, method, hash].join(','))
            }
            case EthereumMethodType.ETH_GAS_PRICE: {
                return sha3([this.url, method].join(','))
            }
            case EthereumMethodType.ETH_GET_BALANCE: {
                const [account, tag = 'latest'] = params as [string, string]
                return sha3([this.url, method, account, tag].join(','))
            }
            case EthereumMethodType.ETH_GET_TRANSACTION_COUNT: {
                const [account, tag = 'latest'] = params as [string, string]
                return sha3([this.url, method, account, tag].join(','))
            }
            case EthereumMethodType.ETH_CALL: {
                const [config, tag = 'latest'] = params as [TransactionConfig, string]
                return sha3([this.url, method, JSON.stringify(config), tag].join(','))
            }
            case EthereumMethodType.ETH_ESTIMATE_GAS: {
                const [config, tag = 'latest'] = params as [TransactionConfig, string]
                return sha3([this.url, method, JSON.stringify(config), tag].join(','))
            }
            case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT: {
                const [hash] = params as [string]
                return sha3([this.url, method, hash].join(','))
            }
            case EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH:
                const [hash] = params as [string]
                return sha3([this.url, method, hash].join(','))
            default:
                return
        }
    }

    static from(url: string, requestArguments: RequestArguments) {
        return new RequestID(url, requestArguments)
    }

    static fromPayload(url: string, payload: JsonRpcPayload) {
        return new RequestID(url, {
            method: payload.method as EthereumMethodType,
            params: payload.params ?? [],
        })
    }
}
