import { useMemo } from 'react'
import JSBI from 'jsbi'
import type { Trade } from '@uniswap/v2-sdk'
import { Percent, CurrencyAmount, Currency, TradeType } from '@uniswap/sdk-core'

const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

// computes realized lp fee as a percent
function computeRealizedLPFeePercent(trade: Trade<Currency, Currency, TradeType>): Percent {
    // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
    // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
    const percent = ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce<Percent>(
            (currentFee: Percent): Percent => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
            ONE_HUNDRED_PERCENT,
        ),
    )
    return new Percent(percent.numerator, percent.denominator)
}

// computes price breakdown for the trade
function computeRealizedLPFeeAmount(
    trade?: Trade<Currency, Currency, TradeType> | null,
): CurrencyAmount<Currency> | undefined {
    if (trade) {
        const realizedLPFee = computeRealizedLPFeePercent(trade)

        // the amount of the input that accrues to LPs
        return CurrencyAmount.fromRawAmount(
            trade.inputAmount.currency,
            trade.inputAmount.multiply(realizedLPFee).quotient,
        )
    }
    return undefined
}

export function useV2TradeBreakdown(trade: Trade<Currency, Currency, TradeType> | null) {
    return useMemo(() => {
        if (!trade) return null
        const realizedLPFeePercent = computeRealizedLPFeePercent(trade)
        const realizedLPFeeAmount = computeRealizedLPFeeAmount(trade)
        return {
            realizedLPFeePercent,
            realizedLPFeeAmount,
            realizedLPFee: trade.inputAmount.multiply(realizedLPFeePercent),
            priceImpact: trade.priceImpact.subtract(realizedLPFeePercent),
        }
    }, [trade])
}
