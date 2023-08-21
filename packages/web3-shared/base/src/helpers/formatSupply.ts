import { BigNumber } from 'bignumber.js'
import { formatCurrency } from './formatCurrency.js'

const boundaryValues = {
    mid: 10000000000,
}

/**
 * format Total supply
 *
 * 1. The number is expressed as a normal number within 1,000,000. i.e. 585,242
 * 2. Retain 2 decimal places. When the decimal point is XX.00, keep 1 zero
 *
 * @returns format result
 * @param value
 */
export function formatSupply(value: BigNumber.Value | null | undefined, fallback?: string | number) {
    if (value === undefined || value === null) return fallback
    const bgValue = new BigNumber(typeof value === 'string' ? value.replaceAll(',', '') : value)
    const isGreaterThanOrEqualToMin = bgValue.isGreaterThanOrEqualTo(boundaryValues.mid)

    const integerValue = bgValue.integerValue(1)
    const decimalValue = bgValue.plus(integerValue.negated()).toFixed(2)
    const finalValue = integerValue.plus(decimalValue)

    if (isGreaterThanOrEqualToMin) return formatCurrency(finalValue, '')
    return finalValue.isNaN() ? fallback : finalValue.toFormat(finalValue.isInteger() ? 0 : 2, 0)
}
