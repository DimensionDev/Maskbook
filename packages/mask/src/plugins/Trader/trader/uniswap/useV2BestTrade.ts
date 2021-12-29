import { useMemo } from 'react'
import { Trade } from '@uniswap/v2-sdk'
import type { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { isTradeBetter } from '../../helpers'
import { useAllCommonPairs } from './useAllCommonPairs'
import { BETTER_TRADE_LESS_HOPS_THRESHOLD, MAX_HOP } from '../../constants'
import type { TradeProvider } from '@masknet/public-api'

export function useV2BestTradeExactIn(
    tradeProvider: TradeProvider,
    currencyAmountIn?: CurrencyAmount<Currency>,
    currencyOut?: Currency,
    { maxHops = MAX_HOP } = {},
) {
    const { value: allowedPairs = [], ...asyncResult } = useAllCommonPairs(
        tradeProvider,
        currencyAmountIn?.currency,
        currencyOut,
    )

    const bestTrade = useMemo(() => {
        if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
            if (maxHops === 1) {
                return (
                    Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
                        maxHops: 1,
                        maxNumResults: 1,
                    })[0] ?? null
                )
            }
            // search through trades with varying hops, find best trade out of them
            let bestTradeSoFar: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null = null
            for (let i = 1; i <= maxHops; i += 1) {
                const currentTrade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null =
                    Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
                        maxHops: i,
                        maxNumResults: 1,
                    })[0] ?? null
                // if current trade is best yet, save it
                if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
                    bestTradeSoFar = currentTrade
                }
            }
            return bestTradeSoFar
        }
        return null
    }, [allowedPairs, currencyAmountIn, currencyOut, maxHops])

    return {
        ...asyncResult,

        // override the trade type from @uniswap/v2-sdk
        value: bestTrade as Trade<Currency, Currency, TradeType.EXACT_INPUT> | null,
    }
}

export function useV2BestTradeExactOut(
    tradeProvider: TradeProvider,
    currencyIn?: Currency,
    currencyAmountOut?: CurrencyAmount<Currency>,
    { maxHops = MAX_HOP } = {},
) {
    const { value: allowedPairs = [], ...asyncResult } = useAllCommonPairs(
        tradeProvider,
        currencyIn,
        currencyAmountOut?.currency,
    )

    const bestTrade = useMemo(() => {
        if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
            if (maxHops === 1) {
                return (
                    Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
                        maxHops: 1,
                        maxNumResults: 1,
                    })[0] ?? null
                )
            }
            // search through trades with varying hops, find best trade out of them
            let bestTradeSoFar: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null = null
            for (let i = 1; i <= maxHops; i += 1) {
                const currentTrade =
                    Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
                        maxHops: i,
                        maxNumResults: 1,
                    })[0] ?? null
                if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
                    bestTradeSoFar = currentTrade
                }
            }
            return bestTradeSoFar
        }
        return null
    }, [currencyIn, currencyAmountOut, allowedPairs, maxHops])

    return {
        ...asyncResult,

        // override the trade type from @uniswap/v2-sdk
        value: bestTrade as Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null,
    }
}
