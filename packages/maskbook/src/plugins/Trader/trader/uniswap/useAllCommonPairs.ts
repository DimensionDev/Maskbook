import { useMemo } from 'react'
import { flatMap } from 'lodash-es'
import type { Pair } from '@uniswap/sdk'
import { toUniswapToken } from '../../helpers'
import { useUniswapPairs, TokenPair, PairState } from './usePairs'
import { BASE_AGAINST_TOKENS, CUSTOM_BASES } from '../../constants'
import { useChainId } from '../../../../web3/hooks/useChainState'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { useUniswapToken } from './useUniswapToken'

export function useAllCommonPairs(
    tokenA?: EtherTokenDetailed | ERC20TokenDetailed,
    tokenB?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    const chainId = useChainId()
    const uniswapTokenA = useUniswapToken(tokenA)
    const uniswapTokenB = useUniswapToken(tokenB)

    const bases = useMemo(() => BASE_AGAINST_TOKENS[chainId].map((t) => toUniswapToken(t.chainId, t)), [chainId])
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
    const { value: allPairs, ...asyncResult } = useUniswapPairs(allPairCombinations as TokenPair[])

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
