import { Route, type Pool } from '@uniswap/v3-sdk'
import { type Currency } from '@uniswap/sdk-core'

export function computeAllRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    chainId: number,
    currentPath: Pool[] = [],
    allPaths: Array<Route<Currency, Currency>> = [],
    startCurrencyIn: Currency = currencyIn,
    maxHops = 2,
): Array<Route<Currency, Currency>> {
    const tokenIn = currencyIn?.wrapped
    const tokenOut = currencyOut?.wrapped
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
