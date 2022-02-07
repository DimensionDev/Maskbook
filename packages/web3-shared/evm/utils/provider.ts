import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { EthereumMethodType, RequestOptions, SendOverrides } from '../types'

const cache = new Map<string, Promise<unknown>>()

/**
 * If it returns a cache id, it means the request can be cached.
 * @param requestArguments
 * @returns
 */
function getCacheId(requestArguments: RequestArguments, overrides?: SendOverrides) {
    // The -1 is not a valid chain id, only used for distinguishing with other explicit chain id.
    const chainId = overrides?.chainId ?? -1
    const { method, params } = requestArguments
    switch (method) {
        case EthereumMethodType.ETH_GET_BALANCE:
            const [account, tag = 'latest'] = params as string[]
            return [chainId, method, account, tag].join('_')
        case EthereumMethodType.ETH_BLOCK_NUMBER:
            return [chainId, method].join('_')
        default:
            return
    }
}

function createSquashedRequest<T extends unknown>(
    request: <T>(requestArguments: RequestArguments, overrides?: SendOverrides, options?: RequestOptions) => Promise<T>,
) {
    return async (requestArguments: RequestArguments, overrides?: SendOverrides, options?: RequestOptions) => {
        const id = getCacheId(requestArguments, overrides)

        // the request cannot be cached
        if (!id) return request<T>(requestArguments, overrides, options)

        // the request is already cached
        if (cache.has(id)) return cache.get(id)

        // the request can be cached
        const unresolved = request<T>(requestArguments, overrides, options).finally(() => cache.delete(id))
        cache.set(id, unresolved)
        return unresolved
    }
}

export function createExternalProvider(
    request: <T extends unknown>(
        requestArguments: RequestArguments,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ) => Promise<T>,
    getOverrides?: () => SendOverrides,
    getOptions?: () => RequestOptions,
) {
    const request_ = createSquashedRequest(request)
    const send = (payload: JsonRpcPayload, callback: (error: Error | null, response?: JsonRpcResponse) => void) => {
        request_(
            {
                method: payload.method,
                params: payload.params,
            },
            getOverrides?.(),
            getOptions?.(),
        ).then(
            (result) => {
                callback(null, {
                    jsonrpc: '2.0',
                    id: payload.id as number,
                    result,
                })
            },
            (error: unknown) => {
                if (error instanceof Error) callback(error)
            },
        )
    }

    return {
        isMetaMask: false,
        isMask: true,
        isStatus: true,
        host: '',
        path: '',
        request: (requestArguments: RequestArguments) => request_(requestArguments, getOverrides?.(), getOptions?.()),
        send,
        sendAsync: send,
    }
}

export function createWeb3(
    request: <T extends unknown>(
        requestArguments: RequestArguments,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ) => Promise<T>,
    getOverrides?: () => SendOverrides,
    getOptions?: () => RequestOptions,
) {
    return new Web3(createExternalProvider(request, getOverrides, getOptions))
}
