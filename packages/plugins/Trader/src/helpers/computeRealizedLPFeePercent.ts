import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Percent, Fraction } from '@uniswap/sdk-core'
import type { Trade } from '../types/index.js'
import { INPUT_FRACTION_AFTER_FEE, ONE_HUNDRED_PERCENT } from '../constants/index.js'

// computes realized lp fee as a percent
export function computeRealizedLPFeePercent(trade: Trade): Percent {
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
                    currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(new Fraction(pool.fee, 1000000))),
                ONE_HUNDRED_PERCENT,
            ),
        )
        return new Percent(percent.numerator, percent.denominator)
    }
}
