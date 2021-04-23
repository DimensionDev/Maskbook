import { BigNumber as BN } from '@ethersproject/bignumber'
import { useMemo } from 'react'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import type { SwapQuoteResponse, TradeComputed, TradeStrategy } from '../../types'

export function useTradeComputed(
    trade: SwapQuoteResponse | null,
    strategy: TradeStrategy,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        const inputAmount = BN.from(trade.sellAmount)
        const executionPrice = BN.from(trade.buyTokenToEthRate).div(BN.from(trade.sellTokenToEthRate))
        const outputAmount = inputAmount.mul(BN.from(executionPrice))
        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            executionPrice,
            fee: BN.from(trade.minimumProtocolFee),
            maximumSold: BN.from(trade.sellAmount),
            minimumReceived: outputAmount,
            priceImpactWithoutFee: BN.from(0),

            // not supported fields
            nextMidPrice: BN.from(0),

            // minimumProtocolFee
            priceImpact: BN.from(0),

            trade_: { ...trade, buyAmount: outputAmount.toString() },
        } as TradeComputed<SwapQuoteResponse>
    }, [trade, strategy, inputToken, outputToken])
}
