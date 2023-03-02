import urlcat from 'urlcat'
import { leftShift } from '@masknet/web3-shared-base'
import { getOpenOceanConstants } from '@masknet/web3-shared-evm'
import type { SwapOOData, SwapOORequest } from '../../types/openocean.js'
import { OPENOCEAN_BASE_URL } from '../../constants/openocean.js'
import { fetchJSON } from '@masknet/web3-providers/helpers'

export async function swapOO(request: SwapOORequest): Promise<SwapOOData> {
    const payload = await fetchJSON<{
        data: string
        outAmount: string
        minOutAmount: number
        to: string
        value: string
        estimatedGas: string
    }>(
        urlcat(OPENOCEAN_BASE_URL, `/${request.chainId}/swap`, {
            inTokenSymbol: request.toToken?.symbol,
            inTokenAddress: request.fromToken?.address,
            outTokenSymbol: request.toToken?.symbol,
            outTokenAddress: request.toToken?.address,
            amount: request.fromAmount,
            gasPrice: 5_000_000_000,
            slippage: request.slippage,
            disabledDexIds: '',
            account: request.userAddr,
            referrer: getOpenOceanConstants(request.chainId).REFERRER_ADDRESS?.toLowerCase(),
        }),
    )
    const { data, outAmount, minOutAmount, to, value, estimatedGas } = payload
    const _resAmount = leftShift(outAmount, request.toToken.decimals).toNumber()
    const _fromAmount = leftShift(request.fromAmount, request.fromToken.decimals).toNumber()
    return {
        data,
        estimatedGas,
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
