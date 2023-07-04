import { useMemo } from 'react'
import type { Currency } from '@uniswap/sdk-core'
import { type Route } from '@uniswap/v3-sdk'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { uniswap } from '@masknet/web3-providers/helpers'
import { useV3SwapPools } from './useV3SwapPools.js'
import { useSingleHopOnly } from './useSingleHopOnly.js'

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

        const routes = uniswap.computeAllRoutes(
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
