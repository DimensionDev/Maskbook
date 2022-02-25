import { sha3 } from 'web3-utils'
import type { RequestArguments, TransactionConfig } from 'web3-core'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { defer } from '@dimensiondev/kit'
import { EthereumMethodType, SendOverrides } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'

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
    private createRequestID(requestArguments: RequestArguments, overrides: SendOverrides | undefined) {
        // The -1 is not a valid chain id, only used for distinguishing with other explicit chain id.
        const chainId = overrides?.chainId ?? -1
        const { method, params } = requestArguments
        switch (method) {
            case EthereumMethodType.ETH_GET_BALANCE:
            case EthereumMethodType.ETH_GET_TRANSACTION_COUNT:
                const [account, tag = 'latest'] = params as [string, string]
                return sha3([chainId, method, account, tag].join('_'))
            case EthereumMethodType.ETH_BLOCK_NUMBER:
                return sha3([chainId, method].join('_'))
            case EthereumMethodType.ETH_CALL: {
                const [config, tag = 'latest'] = params as [TransactionConfig, string]
                return sha3([chainId, method, JSON.stringify(config), tag].join('_'))
            }
            case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
            case EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH:
                const [hash] = params as [string]
                return sha3([chainId, method, hash].join('_'))
            default:
                return
        }
    }

    async fn(context: Context, next: () => Promise<void>) {
        const id = this.createRequestID(context.request, context.sendOverrides)

        // write context with the cached response
        if (id && this.cache.has(id)) {
            const timer = setTimeout(() => {
                context.abort(new Error('Request timeout!'))
            }, 30 * 1000)

            this.cache
                .get(id)
                ?.then((result) => {
                    if (context.method === EthereumMethodType.ETH_GET_BALANCE) {
                        console.log(`balance is: ${result}`)
                    }
                    context.write(result)
                })
                .catch((error) => context.abort(error, 'Failed to send request.'))
                .finally(() => {
                    clearTimeout(timer)
                })
            return
        }

        // cache a deferred request
        if (id) {
            const [promise, resolve, reject] = defer<unknown>()
            this.cache.set(id, promise)

            // throw error if timeout
            const timer = setTimeout(() => {
                reject(new Error('Request timeout!'))
            }, 30 * 1000)

            promise.finally(() => {
                this.cache.delete(id)
                clearTimeout(timer)
            })

            await next()

            if (context.error) reject(context.error)
            else resolve(context.result)

            return
        }
        await next()
    }
}
