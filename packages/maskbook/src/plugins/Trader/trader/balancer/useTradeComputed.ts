import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { BigNumber as BN } from '@ethersproject/bignumber'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { SwapResponse, TradeComputed, TradeStrategy } from '../../types'

const MIN_VALUE = BN.from('100000')

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
        // priceImpact = isExactIn ? inputAmount / tradeAmount : tradeAmount / outputAmount
        let priceImpact = isExactIn
            ? new BigNumber(inputAmount).div(tradeAmount)
            : new BigNumber(tradeAmount).div(outputAmount)
        // priceImpact = (priceImpact * 1e18) / spotPrice) - 1
        priceImpact = priceImpact.times('1e18').div(spotPrice).minus(1)

        return {
            strategy,
            inputAmount: BN.from(isExactIn ? inputAmount : tradeAmount.toFixed()),
            outputAmount: BN.from(!isExactIn ? outputAmount : tradeAmount.toFixed()),
            inputToken,
            outputToken,
            nextMidPrice: BN.from(spotPrice.toFixed()),
            executionPrice: BN.from(spotPrice.toFixed()),
            priceImpact: priceImpact.isNegative() ? MIN_VALUE : BN.from(priceImpact.toFixed()),
            priceImpactWithoutFee: priceImpact.isNegative() ? MIN_VALUE : BN.from(priceImpact.toFixed()),
            maximumSold: BN.from(tradeAmount.toFixed()),
            minimumReceived: BN.from(tradeAmount.toFixed()),
            path: [],
            fee: BN.from(0),
            trade_: trade,
        } as TradeComputed<SwapResponse>
    }, [trade, strategy, inputToken, outputToken])
}
