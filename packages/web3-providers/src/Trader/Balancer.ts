import type { Web3Helper } from '@masknet/web3-helpers'
import {
    getTokenConstants,
    ChainId,
    isNativeTokenAddress,
    ProviderURL,
    getTraderConstants,
} from '@masknet/web3-shared-evm'
import { TradeStrategy, type TradeComputed, type TraderAPI } from '../types/Trader.js'
import { ZERO, isSameAddress, isZero } from '@masknet/web3-shared-base'

import { Web3API } from '../Connection/index.js'
import { first, memoize } from 'lodash-es'
import { SOR } from '@balancer-labs/sor'
import { JsonRpcProvider } from '@ethersproject/providers'
import { BALANCER_SOR_GAS_PRICE, BALANCER_MAX_NO_POOLS } from './constants/balancer.js'
import { BALANCER_SWAP_TYPE, type SwapResponse, type Route } from './types/balancer.js'
import { BigNumber } from 'bignumber.js'

const MIN_VALUE = new BigNumber('1e-5')

export class Balancer implements TraderAPI.Provider {
    private Web3 = new Web3API()

    private createSOR_ = memoize((chainId: ChainId) => {
        return new SOR(
            // we choose a fixed provider cause it's only used here.
            new JsonRpcProvider(ProviderURL.from(chainId)),
            BALANCER_SOR_GAS_PRICE,
            BALANCER_MAX_NO_POOLS,
            chainId,
            '',
        )
    })

    private createSOR(chainId: ChainId) {
        const sor = this.createSOR_(chainId)
        sor.poolsUrl = `${getTraderConstants(chainId).BALANCER_POOLS_URL}?timestamp=${Date.now()}`

        return sor
    }

    private async updatePools(force = false, chainId = ChainId.Mainnet) {
        const sor = this.createSOR(chainId)

        // this fetches all pools list from URL in constructor then onChain balances using Multicall
        if (!sor.isAllFetched || force) {
            sor.poolsUrl = `${getTraderConstants(chainId).BALANCER_POOLS_URL}?timestamp=${Date.now()}`
            await sor.fetchPools()
        }
    }

    private async getSwaps(
        tokenIn: string,
        tokenOut: string,
        swapType: BALANCER_SWAP_TYPE,
        amount: string,
        chainId: ChainId,
    ) {
        const sor = this.createSOR(chainId)

        // this calculates the cost to make a swap which is used as an input to sor to allow it to make gas efficient recommendations.
        // can be set once and will be used for further swap calculations.
        // defaults to 0 if not called or can be set manually using: await sor.setCostOutputToken(tokenOut, manualPriceBn)
        await sor.setCostOutputToken(tokenOut)

        // update pools if necessary
        this.updatePools()

        // get swaps from chain
        const [swaps, tradeAmount, spotPrice] = await sor.getSwaps(tokenIn, tokenOut, swapType, new BigNumber(amount))

        // compose routes
        // learn more: https://github.com/balancer-labs/balancer-frontend/blob/develop/src/components/swap/Routing.vue
        const totalSwapAmount = BigNumber.sum(...swaps.map((rawHops) => first(rawHops)?.swapAmount || '0'))

        const pools = sor.onChainCache.pools
        const routes = swaps.map((rawHops) => {
            const swapAmount = new BigNumber(first(rawHops)?.swapAmount || '0')
            const share = swapAmount.div(totalSwapAmount).toNumber()
            const hops = rawHops.map((rawHop) => {
                const { swapAmount } = rawHop
                const tokenIn = rawHop.tokenIn
                const tokenOut = rawHop.tokenOut
                const rawPool = pools.find((pool) => pool.id === rawHop.pool)
                if (!rawPool) return {}
                const totalWeight = new BigNumber(rawPool.totalWeight)
                const pool = {
                    address: rawPool.id,
                    tokens: rawPool.tokens
                        .map((token) => {
                            const address = token.address
                            const weight = new BigNumber(token.denormWeight)
                            const share = weight.div(totalWeight).toNumber()
                            return {
                                address,
                                share,
                            }
                        })
                        .sort((a, b) => {
                            if (isSameAddress(a.address, tokenIn) || isSameAddress(b.address, tokenOut)) return -1
                            if (isSameAddress(a.address, tokenOut) || isSameAddress(b.address, tokenIn)) return 1
                            return a.share - b.share
                        })
                        .filter((token, index, tokens) => {
                            // Show first 2 and last 2 tokens
                            return index < 2 || index > tokens.length - 3
                        }),
                }
                return {
                    pool,
                    tokenIn,
                    tokenOut,
                    swapAmount,
                }
            })
            return {
                share,
                hops,
            }
        }) as Route[]

        return {
            swaps: [swaps, tradeAmount, spotPrice],
            routes,
        } as SwapResponse
    }
    private async getTrade(
        chainId: ChainId,
        account: string,
        inputAmount: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        const { WNATIVE_ADDRESS } = getTokenConstants(chainId)
        if (!inputToken || !outputToken || isZero(inputAmount)) return null

        // the WETH address is used for looking for available pools
        const sellToken = isNativeTokenAddress(inputToken.address) ? WNATIVE_ADDRESS : inputToken.address
        const buyToken = isNativeTokenAddress(outputToken.address) ? WNATIVE_ADDRESS : outputToken.address

        if (!sellToken || !buyToken) return null

        return this.getSwaps(sellToken, buyToken, BALANCER_SWAP_TYPE.EXACT_IN, inputAmount, chainId)
    }

    public async getTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount_: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll | undefined,
        outputToken?: Web3Helper.FungibleTokenAll | undefined,
    ) {
        try {
            const trade = await this.getTrade(chainId, account, inputAmount_, slippage, inputToken, outputToken)
            if (!trade) return null

            const { swaps: swaps_ } = trade
            const [swaps, tradeAmount, spotPrice] = swaps_

            const priceImpact = new BigNumber(inputAmount_).div(tradeAmount).times('1e18').div(spotPrice).minus(1)

            const computed = {
                strategy: TradeStrategy.ExactIn,
                inputAmount: new BigNumber(inputAmount_),
                outputAmount: new BigNumber(tradeAmount),
                inputToken,
                outputToken,
                executionPrice: new BigNumber(spotPrice),
                priceImpact: priceImpact.isNegative() ? MIN_VALUE : priceImpact,
                maximumSold: new BigNumber(tradeAmount),
                minimumReceived: new BigNumber(tradeAmount),
                path: [],
                fee: ZERO,
                trade_: trade,
            } as TradeComputed<SwapResponse>
        } catch (error) {}
    }

    public async getTradeGasLimit(account: string, chainId: ChainId, trade: TradeComputed<SwapResponse>) {}
}
