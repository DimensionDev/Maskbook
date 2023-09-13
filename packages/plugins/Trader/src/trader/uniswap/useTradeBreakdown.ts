import { useMemo } from 'react'
import type { Trade } from '../../types/index.js'
import { computeRealizedLPFeePercent, computeRealizedLPFeeAmount } from '../../helpers/index.js'

export function useTradeBreakdown(trade: Trade | null) {
    return useMemo(() => {
        try {
            if (!trade) return null
            const realizedLPFeePercent = computeRealizedLPFeePercent(trade)
            const realizedLPFeeAmount = computeRealizedLPFeeAmount(trade)
            return {
                realizedLPFeePercent,
                realizedLPFeeAmount,

                // different ver of @uniswap/sdk-core were used by @uniswap/v2-sdk and @uniswap/v3-sdk
                realizedLPFee: trade.inputAmount.multiply(realizedLPFeePercent),
                priceImpact: trade.priceImpact.subtract(realizedLPFeePercent),
            }
        } catch {
            return null
        }
    }, [trade])
}
