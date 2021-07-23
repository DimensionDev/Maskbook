import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { encodeRouteToPath, Route, Trade } from '@uniswap/v3-sdk'
import { useQuoterContract } from '../../contracts/uniswap/useQuoterContract'
import { useAllV3Routes } from './useAllV3Routes'
import { MulticalStateType, useSingleContractMultipleData } from '@masknet/web3-shared'

export enum V3TradeState {
    LOADING,
    INVALID,
    NO_ROUTE_FOUND,
    VALID,
    SYNCING,
}

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useV3BestTradeExactIn(
    amountIn?: CurrencyAmount<Currency>,
    currencyOut?: Currency,
): { state: V3TradeState; trade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null } {
    const quoter = useQuoterContract()
    const { routes, loading: routesLoading } = useAllV3Routes(amountIn?.currency, currencyOut)

    const quoteExactInInputs = useMemo(() => {
        return routes.map(
            (route) =>
                [encodeRouteToPath(route, false), amountIn ? `0x${amountIn.quotient.toString(16)}` : undefined] as [
                    string,
                    string,
                ],
        )
    }, [amountIn, routes])

    const [quotesResults, , state] = useSingleContractMultipleData(quoter, ['quoteExactInput'], quoteExactInInputs)

    console.log('DEBUG: v3 best trade exact in')
    console.log({
        quotesResults,
        state,
    })

    return useMemo(() => {
        if (!amountIn || !currencyOut) {
            return {
                state: V3TradeState.INVALID,
                trade: null,
            }
        }

        if (routesLoading || state.type === MulticalStateType.PENDING) {
            return {
                state: V3TradeState.LOADING,
                trade: null,
            }
        }

        const { bestRoute, amountOut } = quotesResults.reduce(
            (currentBest: { bestRoute: Route<Currency, Currency> | null; amountOut: string | null }, { value }, i) => {
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
                state: V3TradeState.NO_ROUTE_FOUND,
                trade: null,
            }
        }

        // const isSyncing = quotesResults.some(({ syncing }) => syncing)

        return {
            // state: isSyncing ? V3TradeState.SYNCING : V3TradeState.VALID,
            state: V3TradeState.VALID,
            trade: Trade.createUncheckedTrade({
                route: bestRoute,
                tradeType: TradeType.EXACT_INPUT,
                inputAmount: amountIn,
                outputAmount: CurrencyAmount.fromRawAmount(currencyOut, amountOut),
            }),
        }
    }, [amountIn, currencyOut, quotesResults, routes, routesLoading])
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useV3BestTradeExactOut(
    currencyIn?: Currency,
    amountOut?: CurrencyAmount<Currency>,
): { state: V3TradeState; trade: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null } {
    const quoter = useQuoterContract()
    const { routes, loading: routesLoading } = useAllV3Routes(currencyIn, amountOut?.currency)

    const quoteExactOutInputs = useMemo(() => {
        return routes.map(
            (route) =>
                [encodeRouteToPath(route, true), amountOut ? `0x${amountOut.quotient.toString(16)}` : undefined] as [
                    string,
                    string,
                ],
        )
    }, [amountOut, routes])

    const [quotesResults, , state] = useSingleContractMultipleData(quoter, ['quoteExactOutput'], quoteExactOutInputs)

    return useMemo(() => {
        if (!amountOut || !currencyIn || quotesResults.some(({ error }) => !!error)) {
            return {
                state: V3TradeState.INVALID,
                trade: null,
            }
        }

        if (routesLoading || state.type === MulticalStateType.PENDING) {
            return {
                state: V3TradeState.LOADING,
                trade: null,
            }
        }

        const { bestRoute, amountIn } = quotesResults.reduce(
            (currentBest: { bestRoute: Route<Currency, Currency> | null; amountIn: string | null }, { value }, i) => {
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
                state: V3TradeState.NO_ROUTE_FOUND,
                trade: null,
            }
        }

        return {
            state: V3TradeState.VALID,
            trade: Trade.createUncheckedTrade({
                route: bestRoute,
                tradeType: TradeType.EXACT_OUTPUT,
                inputAmount: CurrencyAmount.fromRawAmount(currencyIn, amountIn),
                outputAmount: amountOut,
            }),
        }
    }, [amountOut, currencyIn, quotesResults, routes, routesLoading])
}
