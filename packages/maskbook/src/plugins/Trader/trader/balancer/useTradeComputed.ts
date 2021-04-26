import { useMemo } from 'react'
import { BigNumber as BN } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { SwapResponse, TradeComputed, TradeStrategy } from '../../types'

const MIN_VALUE = BN.from('1e-5')

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
        let priceImpact = isExactIn
            ? parseUnits(inputAmount || '0', 18).div(tradeAmount)
            : parseUnits(tradeAmount.toString(), 18).div(outputAmount)
        const isNegative = priceImpact.sub(spotPrice).isNegative()
        const priceImpactIsNegative = priceImpact.isNegative()
        // TODO lt BIPS
        const priceImpactPercent = priceImpactIsNegative
            ? '<0.01%'
            : formatUnits(priceImpact.sub(spotPrice).mul(100).div(spotPrice), 2) + '%'

        priceImpact = isNegative ? MIN_VALUE : priceImpact

        return {
            strategy,
            inputAmount: BN.from(isExactIn ? inputAmount : tradeAmount),
            outputAmount: BN.from(!isExactIn ? outputAmount : tradeAmount),
            inputToken,
            outputToken,
            nextMidPrice: spotPrice,
            executionPrice: spotPrice,
            priceImpact: isNegative ? MIN_VALUE : priceImpact,
            priceImpactPercent,
            priceImpactWithoutFee: isNegative ? MIN_VALUE : priceImpact,
            priceImpactWithoutFeePercent: priceImpactPercent,
            maximumSold: tradeAmount,
            minimumReceived: tradeAmount,
            path: [],
            fee: BN.from(0),
            trade_: trade,
        } as TradeComputed<SwapResponse>
    }, [trade, strategy, inputToken, outputToken])
}
