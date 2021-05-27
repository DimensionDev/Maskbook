import { useMemo } from 'react'
import { Trade, Pair } from '@uniswap/sdk'
import BigNumber from 'bignumber.js'
import { toUniswapCurrencyAmount, toUniswapCurrency } from '../../helpers'
import { useChainId } from '../../../../web3/hooks/useChainId'
import { TradeStrategy } from '../../types'
import { useAllCommonPairs } from './useAllCommonPairs'
import type { FungibleTokenDetailed } from '../../../../web3/types'
import { MAX_HOP } from '../../constants'

export function useV2Trade(
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const isExactIn = strategy === TradeStrategy.ExactIn
    const isTradable = !new BigNumber(inputAmount).isZero() || !new BigNumber(outputAmount).isZero()
    const { value: pairs, ...asyncResult } = useAllCommonPairs(inputToken, outputToken)
    const bestTradeExactIn = useBestTradeExactIn(inputAmount, inputToken, outputToken, pairs)
    const bestTradeExactOut = useBestTradeExactOut(outputAmount, inputToken, outputToken, pairs)

    if (
        !isTradable ||
        !inputToken ||
        !outputToken ||
        (inputAmount === '0' && isExactIn) ||
        (outputAmount === '0' && !isExactIn)
    )
        return {
            ...asyncResult,
            error: void 0,
            loading: false,
            value: null,
        }
    return {
        ...asyncResult,
        value: isExactIn ? bestTradeExactIn : bestTradeExactOut,
    }
}

export function useBestTradeExactIn(
    amount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
    pairs: Pair[] = [],
) {
    const chainId = useChainId()
    return useMemo(() => {
        if (new BigNumber(amount).isGreaterThan('0') && inputToken && outputToken && pairs.length > 0)
            return (
                Trade.bestTradeExactIn(
                    pairs,
                    toUniswapCurrencyAmount(chainId, inputToken, amount),
                    toUniswapCurrency(chainId, outputToken),
                    {
                        maxHops: MAX_HOP,
                        maxNumResults: 1,
                    },
                )[0] ?? null
            )
        return null
    }, [pairs, amount, chainId, inputToken?.address, outputToken?.address])
}

export function useBestTradeExactOut(
    amount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
    pairs: Pair[] = [],
) {
    const chainId = useChainId()
    return useMemo(() => {
        if (new BigNumber(amount).isGreaterThan('0') && inputToken && outputToken && pairs.length > 0)
            return (
                Trade.bestTradeExactOut(
                    pairs,
                    toUniswapCurrency(chainId, inputToken),
                    toUniswapCurrencyAmount(chainId, outputToken, amount),
                    {
                        maxHops: MAX_HOP,
                        maxNumResults: 1,
                    },
                )[0] ?? null
            )
        return null
    }, [pairs, amount, chainId, inputToken?.address, outputToken?.address])
}
