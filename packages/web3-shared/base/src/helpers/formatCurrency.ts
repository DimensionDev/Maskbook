import { BigNumber } from 'bignumber.js'
import { scale10 } from './number.js'

const BOUNDARIES = {
    twoDecimalBoundary: scale10(1, -2),
    sixDecimalBoundary: scale10(1, -6),
    eightDecimalBoundary: scale10(1, -8),
    twelveDecimalBoundary: scale10(1, -12),
    sixDecimalExp: 6,
    eightDecimalExp: 8,
    twelveDecimalExp: 12,
}

const DIGITAL_CURRENCY_SYMBOLS: Record<string, string> = {
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
export function formatCurrency(value: BigNumber.Value, currency = 'USD'): string {
    const bn = new BigNumber(value)
    const integerValue = bn.integerValue(1)
    const decimalValue = bn.plus(integerValue.negated())
    const isMoreThanOrEqualToOne = bn.isGreaterThanOrEqualTo(1)

    const {
        sixDecimalBoundary,
        twoDecimalBoundary,
        twelveDecimalBoundary,
        eightDecimalBoundary,
        sixDecimalExp,
        twelveDecimalExp,
    } = BOUNDARIES

    const symbol = currency ? DIGITAL_CURRENCY_SYMBOLS[currency] : ''

    let formatter: Intl.NumberFormat
    let isIntlCurrencyValid = !DIGITAL_CURRENCY_SYMBOLS[currency]

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
        formatter.formatToParts(
            bn.isZero() ? 0 : bn.lt(sixDecimalBoundary) ? sixDecimalBoundary.toNumber() : bn.toNumber(),
        ),
        symbol,
        isDigitalCurrency,
    )

    if (bn.lt(sixDecimalBoundary) || bn.isZero()) {
        const isLessThanTwoDecimalBoundary = bn.lt(twoDecimalBoundary)
        const isLessThanTwelveDecimalBoundary = bn.lt(twelveDecimalBoundary)
        const isGreatThanEightDecimalBoundary = bn.gte(eightDecimalBoundary)
        const value = digitalCurrencyModifierValues
            .map(({ type, value }, i) => {
                switch (type) {
                    case 'currency':
                        return formatCurrencySymbol(symbol ?? value, i === 0)
                    case 'fraction':
                        return bn.isZero()
                            ? '0.00'
                            : isLessThanTwelveDecimalBoundary
                            ? sixDecimalBoundary.toFixed()
                            : isGreatThanEightDecimalBoundary
                            ? bn.decimalPlaces(10).toFixed(twelveDecimalExp).replace(/0+$/, '')
                            : bn.toFixed(twelveDecimalExp).replace(/0+$/, '')
                    default:
                        return ''
                }
            })
            .join('')

        return `${isLessThanTwelveDecimalBoundary && !bn.isZero() ? '< ' : ''}${value}`
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
                    return decimalValue.toFormat(sixDecimalExp).replace('0.', '').replace(/(0+)$/, '')
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
