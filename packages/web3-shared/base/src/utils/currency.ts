import { BigNumber } from 'bignumber.js'
import { defaults } from 'lodash-es'

export interface FormatterCurrencyOptions {
    symbols?: Record<string, string>
    boundaries?: {
        min?: number
    }
}

const DEFAULT_BOUNDARIES = {
    min: 0.000001,
}

const DEFAULT_CRYPTO_CURRENCY_SYMBOLS: Record<string, string> = {
    BTC: '\u20BF',
    ETH: '\u039E',
    SOL: '\u25CE',
    BNB: 'BNB',
    POLYGON: 'MATIC',
    MATIC: 'MATIC',
}

const digitalCurrencyModifier = (parts: Intl.NumberFormatPart[], symbols: Record<string, string>) => {
    const [currencyPart, literalPart, ...rest] = parts
    const symbol = symbols[currencyPart.value]
    if (symbol) return [...rest, literalPart, { ...currencyPart, value: symbol }]
    return parts
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
export function formatCurrency(
    value: BigNumber.Value,
    currency = 'USD',
    { boundaries = {}, symbols = {} }: FormatterCurrencyOptions = {},
): string {
    const bgValue = new BigNumber(value)
    const integerValue = bgValue.integerValue(1)
    const decimalValue = bgValue.plus(integerValue.negated())
    const isMoreThanOrEqualToOne = bgValue.isGreaterThanOrEqualTo(1)

    const resolvedBoundaries = defaults({}, boundaries, DEFAULT_BOUNDARIES)
    const resolvedSymbols = defaults({}, symbols, DEFAULT_CRYPTO_CURRENCY_SYMBOLS)

    const symbol = DEFAULT_CRYPTO_CURRENCY_SYMBOLS[currency]

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: symbol ? 'USD' : currency,
        currencyDisplay: 'narrowSymbol',
    })

    if (bgValue.isZero()) {
        return symbol ? `0.00 ${symbol}` : formatter.format(0)
    }

    const isLessMinValue = bgValue.isLessThan(resolvedBoundaries.min)

    if (isLessMinValue) {
        if (symbol) return `< ${DEFAULT_BOUNDARIES.min} ${symbol}`
        const value = digitalCurrencyModifier(formatter.formatToParts(resolvedBoundaries.min), resolvedSymbols)
            .map(({ type, value }) => {
                switch (type) {
                    case 'currency':
                        return resolvedSymbols[value] ?? value
                    case 'fraction':
                        return resolvedBoundaries.min.toString()
                    default:
                        return ''
                }
            })
            .join('')
        return `< ${value}`
    }

    if (symbol) return `${bgValue.toNumber()} ${symbol}`

    return digitalCurrencyModifier(formatter.formatToParts(bgValue.toNumber()), resolvedSymbols)
        .map(({ type, value }) => {
            switch (type) {
                case 'currency':
                    return resolvedSymbols[value] ?? value
                case 'fraction':
                    const unFormatString = decimalValue.toFormat(isMoreThanOrEqualToOne ? 2 : 6).replace('0.', '')
                    return isLessMinValue || bgValue.isGreaterThanOrEqualTo(1) || isMoreThanOrEqualToOne
                        ? unFormatString
                        : unFormatString.replace(/(0+)$/, '')
                default:
                    return value
            }
        })
        .join('')
}
