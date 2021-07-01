import { isZero, useChainId, FungibleTokenDetailed } from '@masknet/web3-shared'
import { toUniswapCurrencyAmount, toUniswapCurrency } from '../../helpers'
import { TradeStrategy } from '../../types'
import { useV2BestTradeExactIn, useV2BestTradeExactOut } from './useV2Trade'

export function useTrade(
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const isExactIn = strategy === TradeStrategy.ExactIn
    const isTradable = !isZero(inputAmount) || !isZero(outputAmount)

    const chainId = useChainId()
    const inputCurrency = toUniswapCurrency(chainId, inputToken)
    const outputCurrency = toUniswapCurrency(chainId, outputToken)
    const tradeAmount = toUniswapCurrencyAmount(
        chainId,
        isExactIn ? inputToken : outputToken,
        isExactIn ? inputAmount : outputAmount,
    )

    const { value: bestTradeExactIn, ...asyncResultExactIn } = useV2BestTradeExactIn(
        isExactIn ? tradeAmount : undefined,
        outputCurrency,
    )
    const { value: bestTradeExactOut, ...asyncResultExactOut } = useV2BestTradeExactOut(
        inputCurrency,
        !isExactIn ? tradeAmount : undefined,
    )

    if (
        !isTradable ||
        !inputToken ||
        !outputToken ||
        (inputAmount === '0' && isExactIn) ||
        (outputAmount === '0' && !isExactIn)
    )
        return {
            ...(isExactIn ? asyncResultExactIn : asyncResultExactOut),
            error: undefined,
            loading: false,
            value: null,
        }
    return {
        ...(isExactIn ? asyncResultExactIn : asyncResultExactOut),
        value: isExactIn ? bestTradeExactIn : bestTradeExactOut,
    }
}
