import { useMemo } from 'react'
import type { Currency } from '@uniswap/sdk-core'
import { Pool, Route } from '@uniswap/v3-sdk'
import { useChainId } from '@masknet/web3-shared-evm'
import { useV3SwapPools } from './useV3SwapPools'
import { useSingleHopOnly } from './useSingleHopOnly'

function computeAllRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    chainId: number,
    currentPath: Pool[] = [],
    allPaths: Route<Currency, Currency>[] = [],
    startCurrencyIn: Currency = currencyIn,
    maxHops = 2,
): Route<Currency, Currency>[] {
    const tokenIn = currencyIn?.wrapped
    const tokenOut = currencyOut?.wrapped
    if (!tokenIn || !tokenOut) throw new Error('Missing tokenIn/tokenOut')

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
): { loading: boolean; routes: Route<Currency, Currency>[] } {
    const chainId = useChainId()
    const { pools, loading: poolsLoading } = useV3SwapPools(currencyIn, currencyOut)
    const singleHopOnly = useSingleHopOnly()

    return useMemo(() => {
        if (poolsLoading || !chainId || !pools || !currencyIn || !currencyOut) return { loading: true, routes: [] }

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
    }, [chainId, currencyIn?.wrapped.address, currencyOut?.wrapped.address, pools, poolsLoading, singleHopOnly])
}
