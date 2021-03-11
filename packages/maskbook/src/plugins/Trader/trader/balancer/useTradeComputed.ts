import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { SwapResponse, TradeComputed, TradeStrategy } from '../../types'

export function useTradeComputed(
    trade: SwapResponse | null,
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null

        const { swaps: swaps_, routes } = trade
        const [swaps, tradeAmount, spotPrice] = swaps_
        const isExactIn = strategy === TradeStrategy.ExactIn
        const priceImpact = isExactIn
            ? new BigNumber(inputAmount).dividedBy(tradeAmount).multipliedBy('1e18').dividedBy(spotPrice).minus(1)
            : new BigNumber(tradeAmount).dividedBy(outputAmount).multipliedBy('1e18').dividedBy(spotPrice).minus(1)

        return {
            strategy,
            inputAmount: isExactIn ? new BigNumber(inputAmount) : new BigNumber(tradeAmount),
            outputAmount: !isExactIn ? new BigNumber(outputAmount) : new BigNumber(tradeAmount),
            inputToken,
            outputToken,
            nextMidPrice: new BigNumber(spotPrice),
            executionPrice: new BigNumber(spotPrice),
            priceImpact: priceImpact.isNegative() ? new BigNumber('0.00001') : priceImpact,
            priceImpactWithoutFee: priceImpact.isNegative() ? new BigNumber('0.00001') : priceImpact,
            maximumSold: new BigNumber(tradeAmount),
            minimumReceived: new BigNumber(tradeAmount),
            path: [],
            fee: new BigNumber(0),
            trade_: trade,
        } as TradeComputed<SwapResponse>
    }, [trade, strategy, inputToken, outputToken])
}
