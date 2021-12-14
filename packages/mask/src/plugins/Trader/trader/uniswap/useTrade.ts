import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { isZero } from '@masknet/web3-shared-base'
import { TradeStrategy } from '../../types'
import { toUniswapCurrencyAmount, toUniswapCurrency } from '../../helpers'
import { useV2BestTradeExactIn, useV2BestTradeExactOut } from './useV2BestTrade'
import { useV3BestTradeExactIn, useV3BestTradeExactOut } from './useV3BestTrade'
import type { TradeProvider } from '@masknet/public-api'
import { TargetChainIdContext } from '../useTargetChainIdContext'

function useTrade(
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
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const inputCurrency = toUniswapCurrency(chainId, inputToken)
    const outputCurrency = toUniswapCurrency(chainId, outputToken)
    const tradeAmount = toUniswapCurrencyAmount(
        chainId,
        isExactIn ? inputToken : outputToken,
        isExactIn ? inputAmount : outputAmount,
    )
    return {
        isNotAvailable,
        isExactIn,
        tradeAmount,
        inputCurrency,
        outputCurrency,
    }
}

export function useV2Trade(
    tradeProvider: TradeProvider,
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const { isNotAvailable, isExactIn, tradeAmount, inputCurrency, outputCurrency } = useTrade(
        strategy,
        inputAmount,
        outputAmount,
        inputToken,
        outputToken,
    )

    //#region v2
    const v2BestTradeExactIn = useV2BestTradeExactIn(tradeProvider, isExactIn ? tradeAmount : undefined, outputCurrency)
    const v2BestTradeExactOut = useV2BestTradeExactOut(
        tradeProvider,
        inputCurrency,
        !isExactIn ? tradeAmount : undefined,
    )
    //#endregion

    const v2Trade = isExactIn ? v2BestTradeExactIn : v2BestTradeExactOut

    if (isNotAvailable)
        return {
            ...v2Trade,
            error: undefined,
            loading: false,
            value: null,
        }

    return {
        ...v2Trade,
        value: v2Trade.value,
    }
}

export function useV3Trade(
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const { isNotAvailable, isExactIn, tradeAmount, inputCurrency, outputCurrency } = useTrade(
        strategy,
        inputAmount,
        outputAmount,
        inputToken,
        outputToken,
    )

    //#region v3
    const v3BestTradeExactIn = useV3BestTradeExactIn(isExactIn ? tradeAmount : undefined, outputCurrency)
    const v3BestTradeExactOut = useV3BestTradeExactOut(inputCurrency, !isExactIn ? tradeAmount : undefined)
    //#endregion

    const v3Trade = isExactIn ? v3BestTradeExactIn : v3BestTradeExactOut

    if (isNotAvailable)
        return {
            ...v3Trade,
            error: undefined,
            loading: false,
            value: null,
        }
    return {
        ...v3Trade,
        value: v3Trade.value ?? null,
    }
}
