import { useMemo } from 'react'
import { uniswap } from '@masknet/web3-providers/helpers'
import type { Trade } from '../../types/index.js'

export function useTradeBreakdown(trade: Trade | null) {
    return useMemo(() => {
        try {
            if (!trade) return null
            const realizedLPFeePercent = uniswap.computeRealizedLPFeePercent(trade)
            const realizedLPFeeAmount = uniswap.computeRealizedLPFeeAmount(trade)
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
