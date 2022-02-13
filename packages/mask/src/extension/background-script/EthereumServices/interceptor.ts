import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { ChainId, createLookupTableResolver } from '@masknet/web3-shared-evm'
import { BobaInterceptor } from './interceptors'
import type { Interceptor } from './types'

const getInterceptor = createLookupTableResolver<ChainId, Interceptor | null>(
    {
        [ChainId.Mainnet]: null,
        [ChainId.Ropsten]: null,
        [ChainId.Kovan]: null,
        [ChainId.Rinkeby]: null,
        [ChainId.Gorli]: null,
        [ChainId.BSC]: null,
        [ChainId.BSCT]: null,
        [ChainId.Matic]: null,
        [ChainId.Mumbai]: null,
        [ChainId.Arbitrum]: null,
        [ChainId.Arbitrum_Rinkeby]: null,
        [ChainId.xDai]: null,
        [ChainId.Celo]: null,
        [ChainId.Fantom]: null,
        [ChainId.Aurora]: null,
        [ChainId.Avalanche]: null,
        [ChainId.Boba]: new BobaInterceptor(),
        [ChainId.Optimistic]: null,
    },
    null,
)

export function encodePayload(chainId: ChainId, payload: JsonRpcPayload) {
    const interceptor = getInterceptor(chainId)
    return interceptor?.encode?.(payload) ?? payload
}

export function decodeResponse(chainId: ChainId, error: Error | null, response?: JsonRpcResponse) {
    const interceptor = getInterceptor(chainId)
    return interceptor?.decode?.(error, response) ?? [error, response]
}
