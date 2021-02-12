import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import type { Swaps, TradeComputed, TradeStrategy } from '../../types'

export function useTradeComputed(
    trade: Swaps | null,
    strategy: TradeStrategy,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        return {
            strategy,
            inputAmount: new BigNumber('0'),
            outputAmount: new BigNumber('0'),
            executionPrice: new BigNumber('0'),
            trade_: trade,
        } as TradeComputed<Swaps>
    }, [trade, strategy, inputToken, outputToken])
}
