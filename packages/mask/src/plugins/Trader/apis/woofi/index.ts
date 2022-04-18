import type { WoofiSwapResponse, WoofiSwapRequest } from '../../types/woofi'
import { woofiNetworkNames, WOOFI_BASE_URL } from '../../constants'
import urlcat from 'urlcat'
import { leftShift } from '@masknet/web3-shared-base'
import type { NetworkType } from '@masknet/web3-shared-evm'

export async function woofiSwap(request: WoofiSwapRequest, networkType: NetworkType) {
    const response = await fetch(
        // cspell:disable-next-line
        urlcat(WOOFI_BASE_URL, '/woofi_swap', {
            from_token: request.fromToken?.address,
            to_token: request.toToken?.address,
            from_amount: request.fromAmount,
            network: woofiNetworkNames[networkType],
        }),
    )
    const payload: WoofiSwapResponse = await response.json()

    if (payload.status !== 'ok') {
        throw new Error(payload.error?.message ?? 'Unknown Error')
    }

    return {
        toAmount: leftShift(payload.data.to_amount, request.toToken.decimals).toNumber(),
        path: payload.data.path,
        price: payload.data.price,
        tradingFee: payload.data.trading_fee,
        route: payload.data.route,
        singleFeePercentage: payload.data.single_fee_percentage,
        fromAmount: leftShift(request.fromAmount, request.fromToken.decimals).toNumber(),
        value: request.isNativeSellToken ? request.fromAmount : '0',
        slippage: request.slippage,
        fromTokenSymbol: request.fromToken.symbol,
        toTokenSymbol: request.toToken.symbol,
    }
}
