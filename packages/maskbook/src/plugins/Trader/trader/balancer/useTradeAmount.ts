import { BigNumber as BN } from '@ethersproject/bignumber'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { ONE_BIPS, SLIPPAGE_TOLERANCE_DEFAULT } from '../../constants'
import { SwapResponse, TradeComputed, TradeStrategy } from '../../types'

export function useTradeAmount(
    trade: TradeComputed<SwapResponse> | null,
    allowedSlippage = SLIPPAGE_TOLERANCE_DEFAULT,
): BN {
    return useMemo(() => {
        if (!trade) return BN.from(0)
        const result =
            trade.strategy === TradeStrategy.ExactIn
                ? new BigNumber(trade.outputAmount.toString())
                      .div(ONE_BIPS.multipliedBy(allowedSlippage).plus(1))
                      .integerValue(BigNumber.ROUND_DOWN)
                : new BigNumber(trade.inputAmount.toString()).times(
                      ONE_BIPS.multipliedBy(allowedSlippage).plus(1).integerValue(BigNumber.ROUND_DOWN),
                  )
        return BN.from(result.toFixed())
    }, [trade])
}
