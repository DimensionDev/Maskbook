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

const DEFAULT_CURRENCY_SYMBOLS: Record<string, string> = {
    BTC: '\u20BF',
    ETH: '\u039E',
    SOL: '\u25CE',
    BNB: 'BNB',
    POLYGON: 'MATIC',
    AVAX: 'AVAX',
    GLMR: 'GLMR',
    MATIC: 'MATIC',
}

const digitalCurrencyModifier = (parts: Intl.NumberFormatPart[], symbol: string, isDigitalCurrency: boolean) => {
    if (!isDigitalCurrency) return parts
    const [currencyPart, ...rest] = parts
    if (symbol) return [...rest, { ...currencyPart, value: symbol }]
    return parts
}

const formatCurrencySymbol = (symbol: string, isLead: boolean) => {
    return isLead || symbol.length === 0 ? symbol : ` ${symbol}`
}

// https://mask.atlassian.net/wiki/spaces/MASK/pages/122916438/Token
export function formatCurrency(
    value: BigNumber.Value,
    currency = 'USD',
    { boundaries = {} }: FormatterCurrencyOptions = {},
): string {
    const bn = new BigNumber(value)
    const integerValue = bn.integerValue(1)
    const decimalValue = bn.plus(integerValue.negated())
    const isMoreThanOrEqualToOne = bn.isGreaterThanOrEqualTo(1)

    const { min, minExp, expandExp } = defaults({}, boundaries, DEFAULT_BOUNDARIES)

    const symbol = currency ? DEFAULT_CURRENCY_SYMBOLS[currency] : ''

    let formatter: Intl.NumberFormat
    let isIntlCurrencyValid = !DEFAULT_CURRENCY_SYMBOLS[currency]

    try {
        formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: isIntlCurrencyValid ? currency : 'USD',
            currencyDisplay: 'narrowSymbol',
        })
    } catch {
        isIntlCurrencyValid = false
        formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'narrowSymbol',
        })
    }

    const isDigitalCurrency = Boolean(!isIntlCurrencyValid && symbol)
    const digitalCurrencyModifierValues = digitalCurrencyModifier(
        formatter.formatToParts(bn.isZero() ? 0 : bn.lt(min) ? min : bn.toNumber()),
        symbol,
        isDigitalCurrency,
    )

    if (bn.lt(min) || bn.isZero()) {
        const expandBoundary = scale10(1, -minExp - expandExp)
        const isLessThanExpanded = bn.lt(expandBoundary)
        const value = digitalCurrencyModifierValues
            .map(({ type, value }, i) => {
                switch (type) {
                    case 'currency':
                        return formatCurrencySymbol(symbol ?? value, i === 0)
                    case 'fraction':
                        return bn.isZero()
                            ? '0.00'
                            : isLessThanExpanded
                            ? expandBoundary.toFixed()
                            : bn.toFixed(minExp + expandExp).replace(/0+$/, '')
                    default:
                        return ''
                }
            })
            .join('')

        return `${isLessThanExpanded && !bn.isZero() ? '< ' : ''}${value}`
    }

    if (isMoreThanOrEqualToOne) {
        return digitalCurrencyModifierValues
            .map(({ type, value }, i) => {
                switch (type) {
                    case 'currency':
                        return formatCurrencySymbol(symbol ?? value, i === 0)
                    case 'literal':
                        return ''
                    default:
                        return value
                }
            })
            .join('')
    }

    return digitalCurrencyModifierValues
        .map(({ type, value }, i) => {
            switch (type) {
                case 'currency':
                    return formatCurrencySymbol(symbol ?? value, i === 0)
                case 'fraction':
                    return decimalValue.toFormat(6).replace('0.', '').replace(/(0+)$/, '')
                case 'integer':
                    return '0'
                case 'literal':
                    return ''
                default:
                    return value
            }
        })
        .join('')
}
