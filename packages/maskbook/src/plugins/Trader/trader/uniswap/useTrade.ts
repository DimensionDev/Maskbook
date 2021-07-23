import { isZero, useChainId, FungibleTokenDetailed } from '@masknet/web3-shared'
import { toUniswapCurrencyAmount, toUniswapCurrency } from '../../helpers'
import { TradeStrategy } from '../../types'
import { useV2BestTradeExactIn, useV2BestTradeExactOut } from './useV2Trade'
import { useV3BestTradeExactIn, useV3BestTradeExactOut } from './useV3Trade'

export function useTrade(
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const isExactIn = strategy === TradeStrategy.ExactIn
    const isTradable = !isZero(inputAmount) || !isZero(outputAmount)
    const isNotAvailable =
        !isTradable ||
        !inputToken ||
        !outputToken ||
        (inputAmount === '0' && isExactIn) ||
        (outputAmount === '0' && !isExactIn)

    const chainId = useChainId()
    const inputCurrency = toUniswapCurrency(chainId, inputToken)
    const outputCurrency = toUniswapCurrency(chainId, outputToken)
    const tradeAmount = toUniswapCurrencyAmount(
        chainId,
        isExactIn ? inputToken : outputToken,
        isExactIn ? inputAmount : outputAmount,
    )

    //#region v2
    const v2BestTradeExactIn = useV2BestTradeExactIn(isExactIn ? tradeAmount : undefined, outputCurrency)
    const v2BestTradeExactOut = useV2BestTradeExactOut(inputCurrency, !isExactIn ? tradeAmount : undefined)
    //#endregion

    //#rengion v3
    const v3BestTradeExactIn = useV3BestTradeExactIn(isExactIn ? tradeAmount : undefined, outputCurrency)
    const v3BestTradeExactOut = useV3BestTradeExactOut(inputCurrency, !isExactIn ? tradeAmount : undefined)
    //#endregion

    const v2Trade = isExactIn ? v2BestTradeExactIn : v2BestTradeExactOut
    const v3Trade = isExactIn ? v3BestTradeExactIn : v3BestTradeExactOut

    console.log('DEBUG: v3 trade')
    console.log({
        v2Trade,
        v3Trade,
    })

    if (isNotAvailable)
        return {
            ...v2Trade,
            error: undefined,
            loading: false,
            value: null,
        }
    return v2Trade
}
