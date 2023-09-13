import type { Trade } from '@uniswap/v2-sdk'
import type { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { ONE_HUNDRED_PERCENT, ZERO_PERCENT } from '../constants/index.js'

export function isTradeBetter(
    tradeA?: Trade<Currency, Currency, TradeType> | null,
    tradeB?: Trade<Currency, Currency, TradeType> | null,
    minimumDelta: Percent = ZERO_PERCENT,
): boolean | undefined {
    if (tradeA && !tradeB) return false
    if (tradeB && !tradeA) return true
    if (!tradeA || !tradeB) return undefined

    if (
        tradeA.tradeType !== tradeB.tradeType ||
        !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
        !tradeB.outputAmount.currency.equals(tradeB.outputAmount.currency)
    ) {
        throw new Error('Comparing incomparable trades')
    }

    if (minimumDelta.equalTo(ZERO_PERCENT)) {
        return tradeA.executionPrice.lessThan(tradeB.executionPrice)
    } else {
        return tradeA.executionPrice.asFraction
            .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
            .lessThan(tradeB.executionPrice)
    }
}
