import type {
    SwapRouteData,
    SwapRouteErrorResponse,
    SwapRouteRequest,
    SwapRouteResponse,
    SwapRouteSuccessResponse,
} from '../../types/dodo'
import { DODO_BASE_URL } from '../../constants/dodo'
import BigNumber from 'bignumber.js'
import { pow10 } from '@masknet/web3-shared'

export async function swapRoute(request: SwapRouteRequest) {
    const params = new URLSearchParams()
    Object.entries(request).map(([key, value]) => {
        if (typeof value === 'string') params.set(key, value)
    })
    if (request.chainId) params.set('chainId', String(request.chainId))
    if (request.slippage) params.set('slippage', String(request.slippage))
    if (request.fromToken) {
        params.set('fromTokenAddress', request.fromToken.address)
        params.set('fromTokenDecimals', String(request.fromToken.decimals))
    }
    if (request.toToken) {
        params.set('toTokenAddress', request.toToken.address)
        params.set('toTokenDecimals', String(request.toToken.decimals))
    }

    const response = await fetch(`${DODO_BASE_URL}/dodoapi/getdodoroute?${params.toString()}`)
    const payload: SwapRouteResponse = await response.json()

    if (payload.status !== 200) {
        throw new Error(payload.data ?? 'Unknown Error')
    }

    return {
        ...payload.data,
        fromAmount: new BigNumber(request.fromAmount).dividedBy(pow10(request.fromToken.decimals ?? 0)).toNumber(),
        value: request.isNativeSellToken ? request.fromAmount : '0',
    } as SwapRouteData
}
