import { type Currency, CurrencyAmount } from '@uniswap/sdk-core'
import type { Trade } from '../types/index.js'
import { computeRealizedLPFeePercent } from './computeRealizedLPFeePercent.js'

// computes price breakdown for the trade
export function computeRealizedLPFeeAmount(trade?: Trade | null): CurrencyAmount<Currency> | undefined {
    try {
        if (trade) {
            const realizedLPFee = computeRealizedLPFeePercent(trade)

            // the amount of the input that accrues to LPs
            return CurrencyAmount.fromRawAmount(
                trade.inputAmount.currency,
                trade.inputAmount.multiply(realizedLPFee).quotient,
            )
        }
        return
    } catch {
        return
    }
}
