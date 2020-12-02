import { Trade, Percent, JSBI, Fraction, TokenAmount, CurrencyAmount } from '@uniswap/sdk'
import { useMemo } from 'react'

const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

function tradePriceBreakdown(trade: Trade) {
    // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
    // e.g. for 3 tokens/2 hops: 1 - ((1-.03) * (1-.03))
    const realizedLPFee = !trade
        ? undefined
        : ONE_HUNDRED_PERCENT.subtract(
              trade.route.pairs.reduce<Fraction>(
                  (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
                  ONE_HUNDRED_PERCENT,
              ),
          )

    // remove lp fees from price impact
    const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

    // the x*y=k impact
    const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
        ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
        : undefined

    // the amount of the input that accrues to LPs
    const realizedLPFeeAmount =
        realizedLPFee &&
        trade &&
        (trade.inputAmount instanceof TokenAmount
            ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
            : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient))

    return { priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount }
}

export function useV2TradeBreakdown(trade: Trade | null) {
    return useMemo(() => {
        if (!trade) return null
        const { priceImpactWithoutFee, realizedLPFee } = tradePriceBreakdown(trade)
        return {
            priceImpactWithoutFee,
            realizedLPFee,
        }
    }, [trade])
}
