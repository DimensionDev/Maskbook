import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { BigNumber } from 'bignumber.js'
import { type Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { encodeRouteToPath, type Route, Trade } from '@uniswap/v3-sdk'
import { useQuoterContract } from '../../contracts/uniswap/useQuoterContract.js'
import { useAllV3Routes } from './useAllV3Routes.js'
import { DEFAULT_MULTICALL_GAS_LIMIT } from '../../constants/index.js'
import { useSingleContractMultipleData } from '@masknet/web3-hooks-evm'
import { useTargetBlockNumber } from '../useTargetBlockNumber.js'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export enum V3TradeState {
    LOADING = 0,
    INVALID = 1,
    NO_ROUTE_FOUND = 2,
    VALID = 3,
    SYNCING = 4,
}

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useV3BestTradeExactIn(
    amountIn?: CurrencyAmount<Currency>,
    currencyOut?: Currency,
): AsyncStateRetry<Trade<Currency, Currency, TradeType.EXACT_INPUT> | null> {
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const quoterContract = useQuoterContract(pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined)
    const { routes, loading: routesLoading } = useAllV3Routes(amountIn?.currency, currencyOut)
    const quoteExactInInputs = useMemo(() => {
        try {
            return routes.map(
                (route) =>
                    [encodeRouteToPath(route, false), amountIn ? `0x${amountIn.quotient.toString(16)}` : undefined] as [
                        string,
                        string,
                    ],
            )
        } catch {
            return []
        }
    }, [amountIn, routes])

    const { value: blockNumber } = useTargetBlockNumber(chainId)

    const [quotesResults, quotesCalls, , quotesCallback] = useSingleContractMultipleData(
        quoterContract,
        Array.from<'quoteExactInput'>({ length: quoteExactInInputs.length }).fill('quoteExactInput'),
        quoteExactInInputs,
        DEFAULT_MULTICALL_GAS_LIMIT,
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
        blockNumber,
    )
    const {
        loading: quotesLoading,
        error: quotesError,
        retry: quotesRetry,
    } = useAsyncRetry(() => quotesCallback(quotesCalls), [quoterContract, quotesCalls.map((x) => x.join()).join()])

    const asyncBestTrade = (() => {
        if (!amountIn || !currencyOut || pluginID !== NetworkPluginID.PLUGIN_EVM) {
            return {
                value: undefined,
                loading: false,
                error: new Error('Invalid trade info.'),
            }
        }
        if (routesLoading || quotesLoading || (routes.length && !quotesResults.length && !quotesError)) {
            return {
                value: undefined,
                loading: true,
                error: undefined,
            }
        }
        const { bestRoute, amountOut } = quotesResults
            .filter((x) => x.succeed)
            .reduce(
                (
                    currentBest: {
                        bestRoute: Route<Currency, Currency> | null
                        amountOut: string | null
                    },
                    { value },
                    i,
                ) => {
                    if (!value) return currentBest

                    if (currentBest.amountOut === null) {
                        return {
                            bestRoute: routes[i],
                            amountOut: value,
                        }
                    } else if (new BigNumber(currentBest.amountOut).lt(value)) {
                        return {
                            bestRoute: routes[i],
                            amountOut: value,
                        }
                    }

                    return currentBest
                },
                {
                    bestRoute: null,
                    amountOut: null,
                },
            )

        if (!bestRoute || !amountOut) {
            return {
                value: undefined,
                loading: false,
                error: new Error('No route found.'),
            }
        }

        try {
            return {
                value: Trade.createUncheckedTrade({
                    route: bestRoute,
                    tradeType: TradeType.EXACT_INPUT,
                    inputAmount: amountIn,
                    outputAmount: CurrencyAmount.fromRawAmount(currencyOut, amountOut),
                }),
                loading: false,
                error: undefined,
            }
        } catch {
            return {
                value: undefined,
                loading: false,
                error: new Error('Uniswap SDK Error'),
            }
        }
    })()

    return {
        ...asyncBestTrade,
        retry: quotesRetry,
    }
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useV3BestTradeExactOut(
    currencyIn?: Currency,
    amountOut?: CurrencyAmount<Currency>,
): AsyncStateRetry<Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null> {
    const { routes, loading: routesLoading } = useAllV3Routes(currencyIn, amountOut?.currency)
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const quoterContract = useQuoterContract(pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined)
    const quoteExactOutInputs = useMemo(() => {
        try {
            return routes.map(
                (route) =>
                    [
                        encodeRouteToPath(route, true),
                        amountOut ? `0x${amountOut.quotient.toString(16)}` : undefined,
                    ] as [string, string],
            )
        } catch {
            return []
        }
    }, [amountOut, routes])

    const { value: blockNumber } = useTargetBlockNumber(chainId)

    const [quotesResults, quotesCalls, , quotesCallback] = useSingleContractMultipleData(
        quoterContract,
        Array.from<'quoteExactOutput'>({ length: quoteExactOutInputs.length }).fill('quoteExactOutput'),
        quoteExactOutInputs,
        DEFAULT_MULTICALL_GAS_LIMIT,
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
        blockNumber,
    )
    const {
        loading: quotesLoading,
        error: quotesError,
        retry: quotesRetry,
    } = useAsyncRetry(() => quotesCallback(quotesCalls), [quotesCallback, quotesCalls.map((x) => x.join()).join()])
    const asyncBestTrade = (() => {
        if (
            !amountOut ||
            !currencyIn ||
            quotesResults.some(({ error }) => !!error) ||
            pluginID !== NetworkPluginID.PLUGIN_EVM
        ) {
            return {
                value: undefined,
                loading: false,
                error: new Error('Invalid trade info.'),
            }
        }
        if (routesLoading || quotesLoading || (routes.length && !quotesResults.length && !quotesError)) {
            return {
                value: undefined,
                loading: true,
                error: undefined,
            }
        }
        const { bestRoute, amountIn } = quotesResults
            .filter((x) => x.succeed)
            .reduce(
                (
                    currentBest: {
                        bestRoute: Route<Currency, Currency> | null
                        amountIn: string | null
                    },
                    { value },
                    i,
                ) => {
                    if (!value) return currentBest

                    if (currentBest.amountIn === null) {
                        return {
                            bestRoute: routes[i],
                            amountIn: value,
                        }
                    } else if (new BigNumber(currentBest.amountIn).gt(value)) {
                        return {
                            bestRoute: routes[i],
                            amountIn: value,
                        }
                    }

                    return currentBest
                },
                {
                    bestRoute: null,
                    amountIn: null,
                },
            )

        if (!bestRoute || !amountIn) {
            return {
                value: undefined,
                loading: false,
                error: new Error('No route found.'),
            }
        }

        try {
            return {
                value: Trade.createUncheckedTrade({
                    route: bestRoute,
                    tradeType: TradeType.EXACT_OUTPUT,
                    inputAmount: CurrencyAmount.fromRawAmount(currencyIn, amountIn),
                    outputAmount: amountOut,
                }),
                loading: false,
                error: undefined,
            }
        } catch {
            return {
                value: undefined,
                loading: false,
                error: new Error('Uniswap SDK Error.'),
            }
        }
    })()

    return {
        ...asyncBestTrade,
        retry: quotesRetry,
    }
}
