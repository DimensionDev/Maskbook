import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import { type SwapResponse, type TradeComputed, TradeStrategy } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'

const MIN_VALUE = new BigNumber('1e-5')

export function useTradeComputed(
    trade: SwapResponse | null,
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null

        const { swaps: swaps_, routes } = trade
        const [swaps, tradeAmount, spotPrice] = swaps_
        const isExactIn = strategy === TradeStrategy.ExactIn
        let priceImpact = isExactIn
            ? new BigNumber(inputAmount).div(tradeAmount)
            : new BigNumber(tradeAmount).div(outputAmount)
        priceImpact = priceImpact.times('1e18').div(spotPrice).minus(1)

        return {
            strategy,
            inputAmount: new BigNumber(isExactIn ? inputAmount : tradeAmount),
            outputAmount: new BigNumber(!isExactIn ? outputAmount : tradeAmount),
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
    }, [trade, strategy, inputToken, outputToken])
}
