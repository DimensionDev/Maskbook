import type { SwapOOData, SwapOORequest } from '../../types/openocean'
import { OPENOCEAN_BASE_URL } from '../../constants/openocean'
import { leftShift } from '@masknet/web3-shared-base'
import urlcat from 'urlcat'

export async function swapOO(request: SwapOORequest): Promise<SwapOOData> {
    const response = await fetch(
        urlcat(OPENOCEAN_BASE_URL, `/${request.chainId}/swap`, {
            inTokenSymbol: request.toToken?.symbol,
            inTokenAddress: request.fromToken?.address,
            outTokenSymbol: request.toToken?.symbol,
            outTokenAddress: request.toToken?.address,
            amount: request.fromAmount,
            gasPrice: 5000000000,
            slippage: request.slippage,
            disabledDexIds: '',
            account: request.userAddr,
        }),
    )
    const payload = await response.json()
    const { data, outAmount, minOutAmount, to, value } = payload
    const _resAmount = leftShift(outAmount, request.toToken.decimals).toNumber()
    const _fromAmount = leftShift(request.fromAmount, request.fromToken.decimals).toNumber()
    return {
        data,
        targetApproveAddr: request.fromToken.address,
        targetDecimals: request.fromToken.decimals,
        resAmount: _resAmount,
        fromAmount: _fromAmount,
        resPricePerFromToken: +(_fromAmount / _resAmount).toFixed(8),
        resPricePerToToken: +(_resAmount / _fromAmount).toFixed(8),
        to,
        value,
        slippage: request.slippage,
        fromTokenSymbol: request.fromToken.symbol,
        toTokenSymbol: request.toToken.symbol,
        minOutAmount,
    } as SwapOOData
}
