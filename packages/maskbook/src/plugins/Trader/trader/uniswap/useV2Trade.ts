import { useMemo } from 'react'
import { Trade, Pair } from '@uniswap/sdk'
import BigNumber from 'bignumber.js'
import { toUniswapCurrencyAmount, toUniswapCurrency } from '../../helpers'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { TradeStrategy } from '../../types'
import { useAllCommonPairs } from './useAllCommonPairs'
import type { ChainId, ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'

export function useV2Trade(
    from: string,
    againstTokens: {
        [key in ChainId]: ERC20TokenDetailed[]
    },
    customTokens: {
        readonly [key in ChainId]?: {
            [tokenAddress: string]: ERC20TokenDetailed[]
        }
    },
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    const isExactIn = strategy === TradeStrategy.ExactIn
    const { value: pairs, ...asyncResult } = useAllCommonPairs(from, againstTokens, customTokens, inputToken, outputToken)
    const bestTradeExactIn = useBestTradeExactIn(inputAmount, inputToken, outputToken, pairs)
    const bestTradeExactOut = useBestTradeExactOut(outputAmount, inputToken, outputToken, pairs)
    if ((new BigNumber(inputAmount).isZero() && new BigNumber(outputAmount).isZero()) || !inputToken || !outputToken)
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
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
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
                        maxHops: 3,
                        maxNumResults: 1,
                    },
                )[0] ?? null
            )
        return null
    }, [pairs, amount, chainId, inputToken, outputToken])
}

export function useBestTradeExactOut(
    amount: string,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
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
                        maxHops: 3,
                        maxNumResults: 1,
                    },
                )[0] ?? null
            )
        return null
    }, [pairs, amount, chainId, inputToken, outputToken])
}
