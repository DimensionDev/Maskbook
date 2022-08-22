import { ZERO } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { ONE_BIPS, SLIPPAGE_DEFAULT } from '../../constants'
import { SwapResponse, TradeComputed, TradeStrategy } from '../../types'

export function useTradeAmount(trade: TradeComputed<SwapResponse> | null, allowedSlippage = SLIPPAGE_DEFAULT) {
    return useMemo(() => {
        if (!trade) return ZERO
        return trade.strategy === TradeStrategy.ExactIn
            ? trade.outputAmount
                  .dividedBy(ONE_BIPS.multipliedBy(allowedSlippage).plus(1))
                  .integerValue(BigNumber.ROUND_DOWN)
            : trade.inputAmount.times(ONE_BIPS.multipliedBy(allowedSlippage).plus(1).integerValue(BigNumber.ROUND_DOWN))
    }, [trade])
}
