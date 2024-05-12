import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
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
            case EthereumMethodType.eth_getCode: {
                const [address, tag = 'latest'] = params as [string, string]
                return web3_utils.sha3([this.url, method, address, tag].join(','))
            }
            case EthereumMethodType.eth_blockNumber: {
                return web3_utils.sha3([this.url, method].join(','))
            }
            case EthereumMethodType.eth_getBlockByNumber: {
                const [number, full] = params as [string, boolean]
                return web3_utils.sha3([this.url, method, number, full].join(','))
            }
            case EthereumMethodType.eth_getBlockByHash: {
                const [hash] = params as [string]
                return web3_utils.sha3([this.url, method, hash].join(','))
            }
            case EthereumMethodType.eth_gasPrice: {
                return web3_utils.sha3([this.url, method].join(','))
            }
            case EthereumMethodType.eth_getBalance: {
                const [account, tag = 'latest'] = params as [string, string]
                return web3_utils.sha3([this.url, method, account, tag].join(','))
            }
            case EthereumMethodType.eth_getTransactionCount: {
                const [account, tag = 'latest'] = params as [string, string]
                return web3_utils.sha3([this.url, method, account, tag].join(','))
            }
            case EthereumMethodType.eth_call: {
                const [config, tag = 'latest'] = params as [TransactionConfig, string]
                return web3_utils.sha3([this.url, method, JSON.stringify(config), tag].join(','))
            }
            case EthereumMethodType.eth_estimateGas: {
                const [config, tag = 'latest'] = params as [TransactionConfig, string]
                return web3_utils.sha3([this.url, method, JSON.stringify(config), tag].join(','))
            }
            case EthereumMethodType.eth_getTransactionReceipt: {
                const [hash] = params as [string]
                return web3_utils.sha3([this.url, method, hash].join(','))
            }
            case EthereumMethodType.eth_getTransactionByHash:
                const [hash] = params as [string]
                return web3_utils.sha3([this.url, method, hash].join(','))
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
