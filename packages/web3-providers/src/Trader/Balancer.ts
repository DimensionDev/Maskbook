import { first, memoize } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { SOR } from '@balancer-labs/sor'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    getTokenConstants,
    ChainId,
    isNativeTokenAddress,
    ProviderURL,
    getTraderConstants,
    isNativeTokenSchemaType,
    type SchemaType,
    ContractTransaction,
} from '@masknet/web3-shared-evm'
import type { ExchangeProxy } from '@masknet/web3-contracts/types/ExchangeProxy.js'
import { TradeProvider } from '@masknet/public-api'
import { ZERO, isSameAddress, isZero } from '@masknet/web3-shared-base'
import { JsonRpcProvider } from '@ethersproject/providers'
import { BALANCER_SOR_GAS_PRICE, BALANCER_MAX_NO_POOLS } from './constants/balancer.js'
import { TradeStrategy, type TradeComputed, type TraderAPI } from '../types/Trader.js'
import { BALANCER_SWAP_TYPE, type SwapResponse, type Route } from './types/balancer.js'
import { ONE_BIPS, SLIPPAGE_DEFAULT } from './constants/index.js'
import { ContractReadonlyAPI } from '../Web3/EVM/apis/ContractReadonlyAPI.js'

const MIN_VALUE = new BigNumber('1e-5')
const createSOR_ = memoize((chainId: ChainId) => {
    return new SOR(
        // we choose a fixed provider cause it's only used here.
        new JsonRpcProvider(ProviderURL.from(chainId)),
        BALANCER_SOR_GAS_PRICE,
        BALANCER_MAX_NO_POOLS,
        chainId,
        '',
    )
})

const Contract = new ContractReadonlyAPI()

export class Balancer implements TraderAPI.Provider {
    public provider = TradeProvider.BALANCER

    private createSOR(chainId: ChainId) {
        const sor = createSOR_(chainId)
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
        if (!inputToken || !outputToken || isZero(inputAmount)) return null
        const { WNATIVE_ADDRESS } = getTokenConstants(chainId)

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

            try {
                const gas = await this.getTradeGasLimit(account, chainId, computed)

                return {
                    gas,
                    value: computed,
                    provider: this.provider,
                }
            } catch {
                return {
                    value: computed,
                    provider: this.provider,
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                return {
                    value: null,
                    error,
                    provider: this.provider,
                }
            }

            return null
        }
    }

    public async getNativeWrapperTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount: string,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        const { WNATIVE_ADDRESS } = getTokenConstants(chainId)
        const tradeAmount = new BigNumber(inputAmount || '0')
        if (tradeAmount.isZero() || !inputToken || !outputToken || !WNATIVE_ADDRESS) return null

        const wrapperContract = Contract.getWETHContract(WNATIVE_ADDRESS, { chainId })

        const computed = {
            strategy: TradeStrategy.ExactIn,
            inputToken,
            outputToken,
            inputAmount: tradeAmount,
            outputAmount: tradeAmount,
            executionPrice: ZERO,
            maximumSold: ZERO,
            minimumReceived: tradeAmount,
            priceImpact: ZERO,
            fee: ZERO,
            trade_: {
                isWrap: isNativeTokenSchemaType(inputToken.schema as SchemaType),
                isNativeTokenWrapper: true,
            },
        }

        try {
            const tx = await new ContractTransaction(wrapperContract).fillAll(wrapperContract?.methods.deposit(), {
                from: account,
                value: tradeAmount.toFixed(),
            })

            const gas = tx.gas ?? '0'

            return {
                gas,
                provider: this.provider,
                value: computed,
            }
        } catch {
            return {
                value: computed,
                provider: this.provider,
            }
        }
    }

    public async getTradeGasLimit(account: string, chainId: ChainId, trade: TradeComputed<SwapResponse>) {
        const { BALANCER_ETH_ADDRESS, BALANCER_EXCHANGE_PROXY_ADDRESS } = getTraderConstants(chainId)
        const exchangeProxyContract = Contract.getExchangeProxyContract(BALANCER_EXCHANGE_PROXY_ADDRESS, {
            chainId,
        })

        if (!trade?.inputToken || !trade.outputToken || !exchangeProxyContract || !BALANCER_ETH_ADDRESS)
            return ZERO.toString()
        const {
            swaps: [swaps],
        } = trade.trade_ as SwapResponse

        // cast the type to ignore the different type which was generated by typechain
        const swap_: Parameters<ExchangeProxy['methods']['multihopBatchSwapExactIn']>[0] = swaps.map((x) =>
            x.map(
                (y) =>
                    [
                        y.pool,
                        y.tokenIn,
                        y.tokenOut,
                        y.swapAmount,
                        y.limitReturnAmount,
                        y.maxPrice, // uint maxPrice
                    ] as [string, string, string, string, string, string],
            ),
        )

        const inputTokenAddress = isNativeTokenSchemaType(trade.inputToken?.schema as SchemaType | undefined)
            ? BALANCER_ETH_ADDRESS
            : trade.inputToken.address
        const outputTokenAddress = isNativeTokenSchemaType(trade.outputToken?.schema as SchemaType | undefined)
            ? BALANCER_ETH_ADDRESS
            : trade.outputToken.address

        // trade with the native token
        let transactionValue = '0'
        if (
            trade.strategy === TradeStrategy.ExactIn &&
            isNativeTokenSchemaType(trade.inputToken?.schema as SchemaType | undefined)
        )
            transactionValue = trade.inputAmount.toFixed()
        else if (
            trade.strategy === TradeStrategy.ExactOut &&
            isNativeTokenSchemaType(trade.outputToken?.schema as SchemaType | undefined)
        )
            transactionValue = trade.outputAmount.toFixed()

        const tradeAmount = trade.outputAmount.dividedBy(
            ONE_BIPS.multipliedBy(SLIPPAGE_DEFAULT).plus(1).integerValue(BigNumber.ROUND_DOWN),
        )

        const tx = await new ContractTransaction(exchangeProxyContract).fillAll(
            trade.strategy === TradeStrategy.ExactIn
                ? exchangeProxyContract.methods.multihopBatchSwapExactIn(
                      swap_,
                      inputTokenAddress,
                      outputTokenAddress,
                      trade.inputAmount.toFixed(),
                      tradeAmount.toFixed(),
                  )
                : exchangeProxyContract.methods.multihopBatchSwapExactOut(
                      swap_,
                      inputTokenAddress,
                      outputTokenAddress,
                      tradeAmount.toFixed(),
                  ),
            {
                from: account,
                value: transactionValue,
            },
        )

        return tx.gas ?? ZERO.toString()
    }
}
