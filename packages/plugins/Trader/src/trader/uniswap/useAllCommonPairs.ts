import { useMemo } from 'react'
import { flatMap } from 'lodash-es'
import type { Pair } from '@uniswap/v2-sdk'
import type { Currency, Token } from '@uniswap/sdk-core'
import type { TradeProvider } from '@masknet/public-api'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { PairState, usePairs } from './usePairs.js'
import { useGetTradeContext } from '../useGetTradeContext.js'
import { toUniswapToken } from '../../helpers/index.js'

export function useAllCurrencyCombinations(tradeProvider: TradeProvider, currencyA?: Currency, currencyB?: Currency) {
    const { chainId } = useChainContext()
    const Others = useWeb3Others()
    const { pluginID } = useNetworkContext()
    const chainIdValid = Others.chainResolver.isValidChainId(chainId)
    const context = useGetTradeContext(tradeProvider)

    const [tokenA, tokenB] = chainIdValid ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

    const bases: Token[] = useMemo(() => {
        if (!chainIdValid || pluginID !== NetworkPluginID.PLUGIN_EVM) return []
        const common = context?.AGAINST_TOKENS?.[chainId as ChainId] ?? []
        const additionalA = tokenA ? context?.ADDITIONAL_TOKENS?.[chainId as ChainId]?.[tokenA.address] ?? [] : []
        const additionalB = tokenB ? context?.ADDITIONAL_TOKENS?.[chainId as ChainId]?.[tokenB.address] ?? [] : []
        return [...common, ...additionalA, ...additionalB].map((x) => toUniswapToken(chainId as ChainId, x))
    }, [chainId, chainIdValid, tokenA?.address, tokenB?.address, pluginID])

    const basePairs: Array<[Token, Token]> = useMemo(
        () => flatMap(bases, (base): Array<[Token, Token]> => bases.map((otherBase) => [base, otherBase])),
        [bases],
    )

    return useMemo(() => {
        if (!tokenA || !tokenB || pluginID !== NetworkPluginID.PLUGIN_EVM) return []

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
            .filter((tokens): tokens is [Token, Token] => !!(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
                if (!chainIdValid) return true
                const customBases = context?.CUSTOM_TOKENS?.[chainId as ChainId]

                const customBasesA: Token[] | undefined = customBases?.[tokenA.address]?.map((x) =>
                    toUniswapToken(chainId as ChainId, x),
                )
                const customBasesB: Token[] | undefined = customBases?.[tokenB.address]?.map((x) =>
                    toUniswapToken(chainId as ChainId, x),
                )

                if (!customBasesA && !customBasesB) return true

                if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false
                if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false

                return true
            })
    }, [tokenA?.address, tokenB?.address, bases, basePairs, chainId, chainIdValid, pluginID])
}

export function useAllCommonPairs(tradeProvider: TradeProvider, currencyA?: Currency, currencyB?: Currency) {
    const allCurrencyCombinations = useAllCurrencyCombinations(tradeProvider, currencyA, currencyB)

    const { value: allPairs, ...asyncResult } = usePairs(tradeProvider, allCurrencyCombinations)

    // only pass along valid pairs, non-duplicated pairs
    const allPairs_ = useMemo(() => {
        const filtered = new Map<string, Pair>()
        for (const [state, pair] of allPairs as Array<[PairState.EXISTS, Pair]>) {
            // filter out invalid pairs
            if (state !== PairState.EXISTS) continue
            if (!pair) continue
            // filter out duplicated pairs
            const { address } = pair.liquidityToken
            if (filtered.has(address)) continue
            filtered.set(pair.liquidityToken.address, pair)
        }
        return [...filtered.values()]
    }, [allPairs])

    return {
        ...asyncResult,
        value: allPairs_,
    }
}
