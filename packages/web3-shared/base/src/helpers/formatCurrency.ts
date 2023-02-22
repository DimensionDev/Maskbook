import { BigNumber } from 'bignumber.js'
import { defaults } from 'lodash-es'
import { scale10 } from './number.js'

export interface FormatterCurrencyOptions {
    symbols?: Record<string, string>
    boundaries?: {
        min?: BigNumber.Value
        minExp?: number
        expandExp?: number
    }
}

const DEFAULT_BOUNDARIES = {
    min: 0.000001,
    minExp: 6,
    expandExp: 6,
}

const DEFAULT_CRYPTO_CURRENCY_SYMBOLS: Record<string, string> = {
    BTC: '\u20BF',
    ETH: '\u039E',
    SOL: '\u25CE',
    BNB: 'BNB',
    POLYGON: 'MATIC',
    AVAX: 'AVAX',
    GLMR: 'GLMR',
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
    const bn = new BigNumber(value)
    const integerValue = bn.integerValue(1)
    const decimalValue = bn.plus(integerValue.negated())
    const isMoreThanOrEqualToOne = bn.isGreaterThanOrEqualTo(1)

    const { min, minExp, expandExp } = defaults({}, boundaries, DEFAULT_BOUNDARIES)
    const resolvedSymbols = defaults({}, symbols, DEFAULT_CRYPTO_CURRENCY_SYMBOLS)

    const symbol = currency ? DEFAULT_CRYPTO_CURRENCY_SYMBOLS[currency] : ''

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: symbol || symbol === '' ? 'USD' : currency,
        currencyDisplay: 'narrowSymbol',
    })

    if (bn.isZero()) {
        return symbol !== undefined ? `0.00 ${symbol}` : formatter.format(0)
    }

    if (bn.lt(min)) {
        if (symbol !== undefined) return `< ${min} ${symbol}`
        const expandBoundary = scale10(1, -minExp - expandExp)
        const isLessThanExpanded = bn.lt(expandBoundary)
        const value = digitalCurrencyModifier(formatter.formatToParts(min), resolvedSymbols)
            .map(({ type, value }) => {
                switch (type) {
                    case 'currency':
                        return resolvedSymbols[value] ?? value
                    case 'fraction':
                        return isLessThanExpanded
                            ? expandBoundary.toFixed()
                            : bn.toFixed(minExp + expandExp).replace(/0+$/, '')
                    default:
                        return ''
                }
            })
            .join('')
        return `${isLessThanExpanded ? '< ' : ''}${value}`
    }

    if (symbol !== undefined) return `${bn.toNumber()} ${symbol}`

    const digitalCurrencyModifierValues = digitalCurrencyModifier(
        formatter.formatToParts(bn.toNumber()),
        resolvedSymbols,
    )

    if (isMoreThanOrEqualToOne) {
        return digitalCurrencyModifierValues
            .map(({ type, value }) => {
                switch (type) {
                    case 'currency':
                        return resolvedSymbols[value] ?? value
                    default:
                        return value
                }
            })
            .join('')
    }

    return digitalCurrencyModifierValues
        .map(({ type, value }) => {
            switch (type) {
                case 'currency':
                    return resolvedSymbols[value] ?? value
                case 'fraction':
                    const unFormatString = decimalValue.toFormat(isMoreThanOrEqualToOne ? 2 : 6).replace('0.', '')
                    return bn.gte(1) || isMoreThanOrEqualToOne ? unFormatString : unFormatString.replace(/(0+)$/, '')
                case 'integer':
                    return '0'
                default:
                    return value
            }
        })
        .join('')
}
