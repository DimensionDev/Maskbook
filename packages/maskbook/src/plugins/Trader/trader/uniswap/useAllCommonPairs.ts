import { useContext, useMemo } from 'react'
import { flatMap } from 'lodash-es'
import type { Pair } from '@uniswap/v2-sdk'
import type { Currency, Token } from '@uniswap/sdk-core'
import { useChainId, useChainIdValid } from '@masknet/web3-shared'
import { toUniswapToken } from '../../helpers'
import { TradeContext } from '../useTradeContext'
import { PairState, usePairs } from './usePairs'

export function useAllCurrencyCombinations(currencyA?: Currency, currencyB?: Currency) {
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const context = useContext(TradeContext)

    const [tokenA, tokenB] = chainIdValid ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

    const bases: Token[] = useMemo(() => {
        if (!chainIdValid) return []
        const common = context?.AGAINST_TOKENS[chainId] ?? []
        const additionalA = tokenA ? context?.ADDITIONAL_TOKENS[chainId]?.[tokenA.address] ?? [] : []
        const additionalB = tokenB ? context?.ADDITIONAL_TOKENS[chainId]?.[tokenB.address] ?? [] : []
        return [...common, ...additionalA, ...additionalB].map((x) => toUniswapToken(chainId, x))
    }, [chainId, chainIdValid, tokenA, tokenB])

    const basePairs: [Token, Token][] = useMemo(
        () => flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])),
        [bases],
    )

    return useMemo(
        () =>
            tokenA && tokenB
                ? [
                      // the direct pair
                      [tokenA, tokenB],
                      // token A against all bases
                      ...bases.map((base): [Token, Token] => [tokenA, base]),
                      // token B against all bases
                      ...bases.map((base): [Token, Token] => [tokenB, base]),
                      // each base against all bases
                      ...basePairs,
                  ]
                      .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
                      .filter(([t0, t1]) => t0.address !== t1.address)
                      .filter(([tokenA, tokenB]) => {
                          if (!chainIdValid) return true
                          const customBases = context?.CUSTOM_TOKENS?.[chainId]

                          const customBasesA: Token[] | undefined = customBases?.[tokenA.address]?.map((x) =>
                              toUniswapToken(chainId, x),
                          )
                          const customBasesB: Token[] | undefined = customBases?.[tokenB.address]?.map((x) =>
                              toUniswapToken(chainId, x),
                          )

                          if (!customBasesA && !customBasesB) return true

                          if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false
                          if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false

                          return true
                      })
                : [],
        [tokenA, tokenB, bases, basePairs, chainId, chainIdValid],
    )
}

export function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency) {
    const allCurrencyCombinations = useAllCurrencyCombinations(currencyA, currencyB)
    const { value: allPairs, ...asyncResult } = usePairs(allCurrencyCombinations)

    // only pass along valid pairs, non-duplicated pairs
    const allPairs_ = useMemo(
        () =>
            Object.values(
                allPairs
                    // filter out invalid pairs
                    .filter((result): result is [PairState.EXISTS, Pair] =>
                        Boolean(result[0] === PairState.EXISTS && result[1]),
                    )
                    // filter out duplicated pairs
                    .reduce<{ [pairAddress: string]: Pair }>((memo, [, current]) => {
                        memo[current.liquidityToken.address] = memo[current.liquidityToken.address] ?? current
                        return memo
                    }, {}),
            ),
        [allPairs],
    )

    return {
        ...asyncResult,
        value: allPairs_,
    }
}
