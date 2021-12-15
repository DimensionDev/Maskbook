import type { SwapOOData, SwapOORequest } from '../../types/openocean'
import { OPENOCEAN_BASE_URL } from '../../constants/openocean'
import BigNumber from 'bignumber.js'
import { pow10 } from '@masknet/web3-shared-base'
import urlcat from 'urlcat'

export async function swapOO(request: SwapOORequest) {
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
    // if (payload.status !== 200) {
    //     throw new Error((payload as SwapOOErrorResponse).data ?? 'Unknown Error')
    // }
    const { data, outAmount, minOutAmount, to, value } = payload
    const _resAmount = new BigNumber(outAmount).dividedBy(pow10(request.toToken.decimals ?? 0)).toNumber()
    const _fromAmount = new BigNumber(request.fromAmount).dividedBy(pow10(request.fromToken.decimals ?? 0)).toNumber()
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
