import BigNumber from 'bignumber.js'

const boundaryValues = {
    max: 1,
    mid: 0,
    min: 0.000001,
}
/**
 * format token currency
 *
 * 1. price > 1: two decimal places are reserved.
 * 2. 0.000001 <= price < 1
 *      6 decimal places are displayed. The maximum number of digits for USDT Decimals is 6. If the actual number of valid digits after the decimal point is within 6 digits, the valid digits are displayed. Examples are as follows.
 *          0.130000 Display 0.13
 *          0.21100000 shows 0.211
 *
 *      If the actual number of valid digits after the decimal point is more than 6, the first 6 digits will be rounded off. If other token has 18 bits of precision reading, only the first 6 bits are displayed. 0.1234567895548, displayed as 0.123457
 *
 * 3. price < 0.000001, indicating that the price is less than six decimal places
 *
 * @returns format result
 * @param value
 * @param currency
 */
export function formatCurrency(value: BigNumber.Value, currency = 'USD'): string {
    const bgValue = new BigNumber(value)

    const integerValue = bgValue.integerValue(1)
    const decimalValue = bgValue.plus(integerValue.negated())
    const isMoreThanOrEqualToOne = bgValue.isGreaterThanOrEqualTo(1)
    const isLessMinValue = bgValue.isLessThan(boundaryValues.min)
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })

    if (bgValue.isZero()) return formatter.format(0)

    if (isLessMinValue)
        return `< ${formatter
            .formatToParts(boundaryValues.min)
            .map(({ type, value }) => {
                switch (type) {
                    case 'currency':
                        return value
                    case 'fraction':
                        return boundaryValues.min.toString()
                    default:
                        return ''
                }
            })
            .reduce((string, part) => string + part)}`

    return formatter
        .formatToParts(bgValue.toNumber())
        .map(({ type, value }) => {
            switch (type) {
                case 'fraction':
                    const unFormatString = decimalValue.toFormat(isMoreThanOrEqualToOne ? 2 : 6).replace('0.', '')
                    return isLessMinValue || bgValue.isGreaterThanOrEqualTo(1) || isMoreThanOrEqualToOne
                        ? unFormatString
                        : unFormatString.replace(/(0+)$/, '')
                default:
                    return value
            }
        })
        .reduce((string, part) => string + part)
}

export const ethFormatter = (value: BigNumber.Value, sign = '\u039E') => {
    return `${new BigNumber(value).toFixed(2)} ${sign}`
}
