import type {
    SwapRouteData,
    SwapRouteErrorResponse,
    SwapRouteRequest,
    SwapRouteResponse,
    SwapRouteSuccessResponse,
} from '../../types/dodo.js'
import { DODO_BASE_URL } from '../../constants/dodo.js'
import urlcat from 'urlcat'
import { leftShift } from '@masknet/web3-shared-base'

export async function swapRoute(request: SwapRouteRequest) {
    const response = await fetch(
        // cspell:disable-next-line
        urlcat(DODO_BASE_URL, '/dodoapi/getdodoroute', {
            chainId: request.chainId,
            slippage: request.slippage,
            fromTokenAddress: request.fromToken?.address,
            fromTokenDecimals: request.fromToken.decimals,
            toTokenAddress: request.toToken?.address,
            toTokenDecimals: request.toToken.decimals,
            fromAmount: request.fromAmount,
            userAddr: request.userAddr,
            rpc: request.rpc,
        }),
    )
    const payload: SwapRouteResponse = await response.json()

    if (payload.status !== 200) {
        throw new Error((payload as SwapRouteErrorResponse).data ?? 'Unknown Error')
    }

    return {
        ...(payload as SwapRouteSuccessResponse).data,
        fromAmount: leftShift(request.fromAmount, request.fromToken.decimals).toNumber(),
        value: request.isNativeSellToken ? request.fromAmount : '0',
        slippage: request.slippage,
        fromTokenSymbol: request.fromToken.symbol,
        toTokenSymbol: request.toToken.symbol,
    } as SwapRouteData
}
