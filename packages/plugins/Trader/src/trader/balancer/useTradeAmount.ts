import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import { TraderAPI } from '@masknet/web3-providers/types'
import { ONE_BIPS, SLIPPAGE_DEFAULT } from '../../constants/index.js'
import type { SwapResponse } from '../../types/index.js'

export function useTradeAmount(
    trade: TraderAPI.TradeComputed<SwapResponse> | null,
    allowedSlippage = SLIPPAGE_DEFAULT,
) {
    return useMemo(() => {
        if (!trade) return ZERO
        return trade.strategy === TraderAPI.TradeStrategy.ExactIn
            ? trade.outputAmount
                  .dividedBy(ONE_BIPS.multipliedBy(allowedSlippage).plus(1))
                  .integerValue(BigNumber.ROUND_DOWN)
            : trade.inputAmount.times(ONE_BIPS.multipliedBy(allowedSlippage).plus(1).integerValue(BigNumber.ROUND_DOWN))
    }, [trade])
}
