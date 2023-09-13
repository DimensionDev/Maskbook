import { BigNumber } from 'bignumber.js'
import type { Currency, Price } from '@uniswap/sdk-core'

export function uniswapPriceTo(price: Price<Currency, Currency>) {
    return new BigNumber(price.scalar.numerator.toString()).dividedBy(price.scalar.denominator.toString())
}
