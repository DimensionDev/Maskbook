import { BigNumber as BN } from '@ethersproject/bignumber'
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
                ? trade.outputAmount.mul(ONE_BIPS).div(BN.from(allowedSlippage).add(1))
                : trade.inputAmount.mul(ONE_BIPS).mul(BN.from(allowedSlippage).add(1))
        return result
    }, [trade])
}
