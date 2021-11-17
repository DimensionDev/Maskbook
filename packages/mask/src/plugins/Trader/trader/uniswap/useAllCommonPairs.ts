import { useMemo } from 'react'
import { flatMap } from 'lodash-es'
import type { Pair } from '@uniswap/v2-sdk'
import type { Currency, Token } from '@uniswap/sdk-core'
import { useChainIdValid } from '@masknet/web3-shared-evm'
import { toUniswapToken } from '../../helpers'
import { PairState, usePairs } from './usePairs'
import type { TradeProvider } from '@masknet/public-api'
import { useGetTradeContext } from '../useGetTradeContext'
import { TargetChainIdContext } from '../useTargetChainIdContext'

export function useAllCurrencyCombinations(tradeProvider: TradeProvider, currencyA?: Currency, currencyB?: Currency) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const chainIdValid = useChainIdValid()
    const context = useGetTradeContext(tradeProvider)

    const [tokenA, tokenB] = chainIdValid ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

    const bases: Token[] = useMemo(() => {
        if (!chainIdValid) return []
        const common = context?.AGAINST_TOKENS?.[chainId] ?? []
        const additionalA = tokenA ? context?.ADDITIONAL_TOKENS?.[chainId]?.[tokenA.address] ?? [] : []
        const additionalB = tokenB ? context?.ADDITIONAL_TOKENS?.[chainId]?.[tokenB.address] ?? [] : []
        return [...common, ...additionalA, ...additionalB].map((x) => toUniswapToken(chainId, x))
    }, [chainId, chainIdValid, tokenA?.address, tokenB?.address])

    const basePairs: [Token, Token][] = useMemo(
        () => flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])),
        [bases],
    )

    return useMemo(() => {
        if (!tokenA || !tokenB) return []

        return [
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
    }, [tokenA?.address, tokenB?.address, bases, basePairs, chainId, chainIdValid])
}

export function useAllCommonPairs(tradeProvider: TradeProvider, currencyA?: Currency, currencyB?: Currency) {
    const allCurrencyCombinations = useAllCurrencyCombinations(tradeProvider, currencyA, currencyB)

    const { value: allPairs, ...asyncResult } = usePairs(tradeProvider, allCurrencyCombinations)

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
                    .reduce<Record<string, Pair>>((memo, [, current]) => {
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
