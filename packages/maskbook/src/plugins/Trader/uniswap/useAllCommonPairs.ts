import { useChainId } from '../../../web3/hooks/useChainState'
import { BASE_AGAINST_TOKENS, CUSTOM_BASES } from '../constants'
import type { Token } from '../../../web3/types'
import { useMemo } from 'react'
import { flatMap } from 'lodash-es'
import { toUniswapToken } from '../helpers'
import { useUniswapPairs, TokenPair, PairState } from './usePairs'
import type { Pair } from '@uniswap/sdk'

export function useAllCommonPairs(tokenA?: Token, tokenB?: Token) {
    const chainId = useChainId()
    const [uniswapTokenA, uniswapTokenB] = [
        tokenA ? toUniswapToken(chainId, tokenA) : undefined,
        tokenB ? toUniswapToken(chainId, tokenB) : undefined,
    ]

    const bases = useMemo(() => BASE_AGAINST_TOKENS[chainId].map((t) => toUniswapToken(t.chainId, t)), [
        BASE_AGAINST_TOKENS[chainId],
    ])
    const basePairs = useMemo(
        () =>
            flatMap(bases, (base) => bases.map((otherBase) => [base, otherBase] as TokenPair)).filter(
                ([t0, t1]) => t0.address !== t1.address,
            ),
        [bases],
    )
    const allPairCombinations = useMemo(
        () =>
            uniswapTokenA && uniswapTokenB
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
                          const customBases = CUSTOM_BASES[chainId]
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
        [[uniswapTokenA?.address, uniswapTokenB?.address].sort().join(), bases, basePairs, chainId],
    )
    const allPairs = useUniswapPairs(allPairCombinations as TokenPair[])
    // only pass along valid pairs, non-duplicated pairs
    return useMemo(
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
}
