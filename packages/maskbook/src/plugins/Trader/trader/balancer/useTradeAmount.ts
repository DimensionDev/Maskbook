import { BigNumber } from '@balancer-labs/sor/dist/utils/bignumber'
import { useMemo } from 'react'
import { ONE_BIPS, SLIPPAGE_TOLERANCE_DEFAULT } from '../../constants'
import { SwapResponse, TradeComputed, TradeStrategy } from '../../types'

export function useTradeAmount(
    trade: TradeComputed<SwapResponse> | null,
    allowedSlippage = SLIPPAGE_TOLERANCE_DEFAULT,
) {
    return useMemo(() => {
        if (!trade) return new BigNumber(0)
        return trade.strategy === TradeStrategy.ExactIn
            ? trade.outputAmount
                  .dividedBy(ONE_BIPS.multipliedBy(allowedSlippage).add(1))
                  .integerValue(BigNumber.ROUND_DOWN)
            : trade.inputAmount.multipliedBy(
                  ONE_BIPS.multipliedBy(allowedSlippage).add(1).integerValue(BigNumber.ROUND_DOWN),
              )
    }, [trade])
}
