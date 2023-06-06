import { useMemo } from 'react'
import type { Currency } from '@uniswap/sdk-core'
import { type Pool, Route } from '@uniswap/v3-sdk'
import { useV3SwapPools } from './useV3SwapPools.js'
import { useSingleHopOnly } from './useSingleHopOnly.js'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

function computeAllRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    chainId: number,
    currentPath: Pool[] = [],
    allPaths: Array<Route<Currency, Currency>> = [],
    startCurrencyIn: Currency = currencyIn,
    maxHops = 2,
): Array<Route<Currency, Currency>> {
    const tokenIn = currencyIn.wrapped
    const tokenOut = currencyOut.wrapped
    if (!tokenIn || !tokenOut) throw new Error('Missing tokenIn/tokenOut')

    try {
        for (const pool of pools) {
            if (currentPath.includes(pool) || !pool.involvesToken(tokenIn)) continue

            const outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0
            if (outputToken.equals(tokenOut)) {
                allPaths.push(new Route([...currentPath, pool], startCurrencyIn, currencyOut))
            } else if (maxHops > 1) {
                computeAllRoutes(
                    outputToken,
                    currencyOut,
                    pools,
                    chainId,
                    [...currentPath, pool],
                    allPaths,
                    startCurrencyIn,
                    maxHops - 1,
                )
            }
        }
    } catch {
        return []
    }

    return allPaths
}

/**
 * Returns all the routes from an input currency to an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useAllV3Routes(
    currencyIn?: Currency,
    currencyOut?: Currency,
): {
    loading: boolean
    routes: Array<Route<Currency, Currency>>
} {
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { pools, loading: poolsLoading } = useV3SwapPools(currencyIn, currencyOut)
    const singleHopOnly = useSingleHopOnly()

    return useMemo(() => {
        if (
            poolsLoading ||
            !chainId ||
            !pools ||
            !currencyIn ||
            !currencyOut ||
            pluginID !== NetworkPluginID.PLUGIN_EVM
        )
            return { loading: true, routes: [] }

        const routes = computeAllRoutes(
            currencyIn,
            currencyOut,
            pools,
            chainId,
            [],
            [],
            currencyIn,
            singleHopOnly ? 1 : 2,
        )
        return { loading: false, routes }
    }, [
        chainId,
        currencyIn?.wrapped.address,
        currencyOut?.wrapped.address,
        pools,
        poolsLoading,
        singleHopOnly,
        pluginID,
    ])
}
