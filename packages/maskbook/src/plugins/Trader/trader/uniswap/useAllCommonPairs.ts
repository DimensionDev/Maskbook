import { useContext, useMemo } from 'react'
import { flatMap } from 'lodash-es'
import type { Pair } from '@uniswap/sdk'
import { toUniswapChainId, toUniswapToken } from '../../helpers'
import { usePairs, TokenPair, PairState } from './usePairs'
import { useChainId } from '../../../../web3/hooks/useChainId'
import type { FungibleTokenDetailed } from '../../../../web3/types'
import { useUniswapToken } from './useUniswapToken'
import { TradeContext } from '../useTradeContext'

export function useAllCommonPairs(tokenA?: FungibleTokenDetailed, tokenB?: FungibleTokenDetailed) {
    const chainId = useChainId()
    const context = useContext(TradeContext)
    const uniswapTokenA = useUniswapToken(tokenA)
    const uniswapTokenB = useUniswapToken(tokenB)

    const bases = useMemo(
        () => context?.AGAINST_TOKENS[chainId].map((t) => toUniswapToken(t.chainId, t)) ?? [],
        [chainId, context],
    )
    const basePairs = useMemo(
        () =>
            flatMap(bases, (base) => bases.map((otherBase) => [base, otherBase] as TokenPair)).filter(
                ([t0, t1]) => t0.address !== t1.address,
            ),
        [bases],
    )
    const allPairCombinations = useMemo(
        () =>
            uniswapTokenA &&
            uniswapTokenB &&
            uniswapTokenA.chainId === toUniswapChainId(chainId) &&
            uniswapTokenA.chainId === uniswapTokenB.chainId
                ? [
                      // the direct pair
                      [uniswapTokenA, uniswapTokenB] as TokenPair,
                      // token A against all bases
                      ...bases.map((base) => [uniswapTokenA, base] as TokenPair),
                      // token B against all bases
                      ...bases.map((base) => [uniswapTokenB, base] as TokenPair),
                      // each base against all bases
                      ...basePairs,
                  ]
                      .filter((tokens) => Boolean(tokens[0] && tokens[1]))
                      .filter(([t0, t1]) => t0!.address !== t1!.address)
                      .filter(([uniswapTokenA, uniswapTokenB]) => {
                          if (!chainId) return true
                          const customBases = context?.CUSTOM_TOKENS[chainId]
                          if (!customBases) return true
                          const customBasesA = customBases[uniswapTokenA.address]
                          const customBasesB = customBases[uniswapTokenB.address]

                          if (!customBasesA && !customBasesB) return true
                          if (
                              customBasesA &&
                              !customBasesA
                                  .map((t) => toUniswapToken(t.chainId, t))
                                  .find((base) => uniswapTokenB!.equals(base))
                          )
                              return false
                          if (
                              customBasesB &&
                              !customBasesB
                                  .map((t) => toUniswapToken(t.chainId, t))
                                  .find((base) => uniswapTokenA!.equals(base))
                          )
                              return false

                          return true
                      })
                : [],
        [[uniswapTokenA?.address, uniswapTokenB?.address].sort().join(), bases, basePairs, chainId, context],
    )
    const { value: allPairs, ...asyncResult } = usePairs(allPairCombinations)

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
