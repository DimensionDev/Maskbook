import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { ZERO, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { SwapResponse, TradeComputed, TradeStrategy } from '../../types'

const MIN_VALUE = new BigNumber('1e-5')

export function useTradeComputed(
    trade: SwapResponse | null,
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
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
