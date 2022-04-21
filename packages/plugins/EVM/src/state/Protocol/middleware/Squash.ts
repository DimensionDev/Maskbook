import { sha3 } from 'web3-utils'
import type { RequestArguments, TransactionConfig } from 'web3-core'
import { defer } from '@dimensiondev/kit'
import { EthereumMethodType } from '@masknet/web3-shared-evm'
import type { Context, Middleware, EVM_ConnectionOptions } from '../types'

/**
 * Squash multiple RPC requests into a single one.
 */
export class Squash implements Middleware<Context> {
    private cache = new Map<string, Promise<unknown>>()

    /**
     * If it returns a cache id, existence means the request can be cached.
     * @param requestArguments
     * @returns
     */
    private createRequestID(requestArguments: RequestArguments, overrides?: EVM_ConnectionOptions) {
        // The -1 is not a valid chain id, only used for distinguishing with other explicit chain id.
        const chainId = overrides?.chainId ?? -1
        const { method, params } = requestArguments
        switch (method) {
            case EthereumMethodType.ETH_GET_CODE: {
                const [address, tag = 'latest'] = params as [string, string]
                return sha3([chainId, method, address, tag].join())
            }
            case EthereumMethodType.ETH_GET_BALANCE:
            case EthereumMethodType.ETH_GET_TRANSACTION_COUNT:
                const [account, tag = 'latest'] = params as [string, string]
                return sha3([chainId, method, account, tag].join())
            case EthereumMethodType.ETH_BLOCK_NUMBER:
                return sha3([chainId, method].join())
            case EthereumMethodType.ETH_CALL:
            case EthereumMethodType.ETH_ESTIMATE_GAS: {
                const [config, tag = 'latest'] = params as [TransactionConfig, string]
                return sha3([chainId, method, JSON.stringify(config), tag].join())
            }
            case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
            case EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH:
                const [hash] = params as [string]
                return sha3([chainId, method, hash].join())
            default:
                return
        }
    }

    async fn(context: Context, next: () => Promise<void>) {
        const id = this.createRequestID(context.request, context.requestOptions)

        // unable to cache the request
        if (!id) {
            await next()
            return
        }

        // squash into the cached request
        if (this.cache.has(id)) {
            try {
                context.write(await this.cache.get(id))
            } catch (error) {
                context.abort(error)
            } finally {
                await next()
            }
            return
        }

        // cache a request
        const [promise, resolve, reject] = defer<unknown>()

        this.cache.set(id, promise)
        await next()
        this.cache.delete(id)

        if (context.error) reject(context.error)
        else resolve(context.result)
    }
}
