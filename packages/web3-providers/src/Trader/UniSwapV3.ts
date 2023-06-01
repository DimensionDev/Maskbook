import { compact } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { TradeProvider } from '@masknet/public-api'
import { type ChainId, getTraderConstants } from '@masknet/web3-shared-evm'
import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import type { Currency, Token } from '@uniswap/sdk-core'
import { FeeAmount, Pool, type Route, computePoolAddress, encodeRouteToPath, Trade } from '@uniswap/v3-sdk'
import { isZero } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { getTradeContext } from './helpers/trade.js'
import { computeAllRoutes } from './helpers/uniswap.js'
import { PoolState, type TradeContext, type Trade as TradeResult } from '../types/Trader.js'
import { UniSwapV2Like } from './UniSwapV2.js'

export class UniSwapV3Like extends UniSwapV2Like {
    constructor() {
        super(TradeProvider.UNISWAP_V3)
    }

    private getPoolAddresses(transformed: Array<[Token, Token, FeeAmount] | null>, context: TradeContext) {
        try {
            return transformed.map((value) => {
                if (!context?.IS_UNISWAP_V3_LIKE) return ''
                if (!context?.FACTORY_CONTRACT_ADDRESS || !value) return ''
                return computePoolAddress({
                    factoryAddress: context.FACTORY_CONTRACT_ADDRESS,
                    tokenA: value[0],
                    tokenB: value[1],
                    fee: value[2],
                })
            })
        } catch {
            return []
        }
    }

    private getQuoteExactInInputs(routes: Array<Route<Currency, Currency>>, amountIn?: CurrencyAmount<Currency>) {
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
    }

    private async getPools(
        chainId: ChainId,
        poolKeys: Array<[Currency | undefined, Currency | undefined, FeeAmount | undefined]>,
    ) {
        const context = getTradeContext(chainId, this.provider)

        if (!context) return EMPTY_LIST
        const transformed: Array<[Token, Token, FeeAmount] | null> = poolKeys.map(
            ([currencyA, currencyB, feeAmount]) => {
                if (!chainId || !currencyA || !currencyB || !feeAmount) return null

                const tokenA = currencyA?.wrapped
                const tokenB = currencyB?.wrapped
                if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null
                const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
                return [token0, token1, feeAmount]
            },
        )

        const poolAddresses = this.getPoolAddresses(transformed, context)
        const poolContracts = compact(poolAddresses.map((x) => this.Contract.getPoolStateV3(x, { chainId })))

        const slot0sCalls = this.Multicall.createMultipleContractSingleData(
            poolContracts,
            Array.from<'slot0'>({ length: poolContracts.length }).fill('slot0'),
            [],
        )
        const liquiditiesCalls = this.Multicall.createMultipleContractSingleData(
            poolContracts,
            Array.from<'liquidity'>({ length: poolContracts.length }).fill('liquidity'),
            [],
        )

        const slot0s = await this.Multicall.call(
            chainId,
            poolContracts,
            Array.from<'slot0'>({ length: poolContracts.length }).fill('slot0'),
            slot0sCalls,
        )
        const liquidities = await this.Multicall.call(
            chainId,
            poolContracts,
            Array.from<'liquidity'>({ length: poolContracts.length }).fill('liquidity'),
            liquiditiesCalls,
        )

        return poolKeys.map((_key, index) => {
            const [token0, token1, fee] = transformed[index] ?? []
            if (!token0 || !token1 || !fee) return [PoolState.INVALID, null]

            const { value: slot0, error: slot0Error } = slot0s[index] ?? {}
            const { value: liquidity, error: liquidityError } = liquidities[index] ?? {}

            if (slot0Error || liquidityError) return [PoolState.INVALID, null]

            if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]

            if (isZero(slot0.sqrtPriceX96 ?? 0)) return [PoolState.NOT_EXISTS, null]

            try {
                return [
                    PoolState.EXISTS,
                    new Pool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], Number.parseInt(slot0.tick, 10)),
                ]
            } catch (error) {
                console.error('Error when constructing the pool', error)
                return [PoolState.NOT_EXISTS, null]
            }
        })
    }

    public override async getBestTradeExactIn(
        chainId: ChainId,
        currencyAmountIn: CurrencyAmount<Currency>,
        currencyOut: Currency,
    ): Promise<TradeResult | null> {
        const { UNISWAP_V3_QUOTER_ADDRESS } = getTraderConstants(chainId)
        if (!UNISWAP_V3_QUOTER_ADDRESS) return null

        const quoterContract = this.Contract.getQuoterContract(UNISWAP_V3_QUOTER_ADDRESS, { chainId })

        const allCurrencyCombinations = this.getAllCommonPairs(chainId, currencyAmountIn?.currency, currencyOut)

        const allCurrencyCombinationsWithAllFees = allCurrencyCombinations.flatMap<[Token, Token, FeeAmount]>(
            ([tokenA, tokenB]) => [
                [tokenA, tokenB, FeeAmount.LOW],
                [tokenA, tokenB, FeeAmount.MEDIUM],
                [tokenA, tokenB, FeeAmount.HIGH],
            ],
        )

        const pools = await this.getPools(chainId, allCurrencyCombinationsWithAllFees)
        const swapPools = pools
            .filter((tuple): tuple is [PoolState.EXISTS, Pool] => {
                return tuple[0] === PoolState.EXISTS && tuple[1] !== null
            })
            .map(([, pool]) => pool)

        const routers = computeAllRoutes(
            currencyAmountIn.currency,
            currencyOut,
            swapPools,
            chainId,
            [],
            [],
            currencyAmountIn?.currency,
            2,
        )

        const quoteExactInInputs = this.getQuoteExactInInputs(routers, currencyAmountIn)

        if (!quoterContract) return null

        const quotesCalls = this.Multicall.createSingleContractMultipleData(
            quoterContract,
            Array.from<'quoteExactInput'>({ length: quoteExactInInputs.length }).fill('quoteExactInput'),
            quoteExactInInputs,
        )

        const quotesResults = await this.Multicall.call(
            chainId,
            Array.from({ length: quoteExactInInputs.length }).map(() => quoterContract),
            Array.from<'quoteExactInput'>({ length: quoteExactInInputs.length }).fill('quoteExactInput'),
            quotesCalls,
        )

        const asyncBestTrade = (() => {
            if (!currencyAmountIn || !currencyOut) {
                return {
                    value: undefined,
                    loading: false,
                    error: new Error('Invalid trade info.'),
                }
            }
            if (routers.length && !quotesResults.length) {
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
                                bestRoute: routers[i],
                                amountOut: value,
                            }
                        } else if (new BigNumber(currentBest.amountOut).lt(value)) {
                            return {
                                bestRoute: routers[i],
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
                        inputAmount: currencyAmountIn,
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

        if (!asyncBestTrade.value) return null

        return asyncBestTrade.value
    }
}
