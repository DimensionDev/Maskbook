import { useMemo } from 'react'
import JSBI from 'jsbi'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Percent, Fraction, CurrencyAmount, Currency } from '@uniswap/sdk-core'
import type { Trade } from '../../types'

const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

// computes realized lp fee as a percent
function computeRealizedLPFeePercent(trade: Trade): Percent {
    if (trade instanceof V2Trade) {
        // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
        // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
        const percent = ONE_HUNDRED_PERCENT.subtract(
            trade.route.pairs.reduce<Percent>(
                (currentFee: Percent): Percent => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
                ONE_HUNDRED_PERCENT,
            ),
        )
        return new Percent(percent.numerator, percent.denominator)
    } else {
        const percent = ONE_HUNDRED_PERCENT.subtract(
            trade.route.pools.reduce<Percent>(
                (currentFee: Percent, pool): Percent =>
                    currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(new Fraction(pool.fee, 1_000_000))),
                ONE_HUNDRED_PERCENT,
            ),
        )
        return new Percent(percent.numerator, percent.denominator)
    }
}

// computes price breakdown for the trade
function computeRealizedLPFeeAmount(trade?: Trade | null): CurrencyAmount<Currency> | undefined {
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

export function useTradeBreakdown(trade: Trade | null) {
    return useMemo(() => {
        if (!trade) return null
        const realizedLPFeePercent = computeRealizedLPFeePercent(trade)
        const realizedLPFeeAmount = computeRealizedLPFeeAmount(trade)
        return {
            realizedLPFeePercent,
            realizedLPFeeAmount,

            // different ver of @uniswap/sdk-core were used by @uniswap/v2-sdk and @uniswap/v3-sdk
            realizedLPFee: trade.inputAmount.multiply(realizedLPFeePercent) as CurrencyAmount<Currency>,
            priceImpact: trade.priceImpact.subtract(realizedLPFeePercent) as Percent,
        }
    }, [trade])
}
