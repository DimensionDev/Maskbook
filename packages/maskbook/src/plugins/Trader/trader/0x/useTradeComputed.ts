import BigNumber from 'bignumber.js'
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
        return {
            strategy,
            inputAmount: new BigNumber(trade.sellAmount),
            outputAmount: new BigNumber(trade.buyAmount),
            executionPrice: new BigNumber(trade.price),

            fee: new BigNumber(trade.minimumProtocolFee),
            maximumSold: new BigNumber(trade.sellAmount),
            minimumReceived: new BigNumber(trade.guaranteedPrice).multipliedBy(
                new BigNumber(10).pow(outputToken.decimals ?? 0),
            ),
            priceImpactWithoutFee: new BigNumber(0),

            // not supported fields
            nextMidPrice: new BigNumber(0),

            // minimumProtocolFee
            priceImpact: new BigNumber(0),

            trade_: trade,
        } as TradeComputed<SwapQuoteResponse>
    }, [trade, strategy, inputToken, outputToken])
}
