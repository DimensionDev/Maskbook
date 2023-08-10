import { BigNumber } from 'bignumber.js'
import { scale10 } from './number.js'
import { CurrencyType } from '../index.js'

export interface FormatterCurrencyOptions {
    onlyRemainTwoDecimal?: boolean
    fiatCurrencyRate?: number
    customDecimalConfig?: {
        boundary: BigNumber
        decimalExp: number
    }
}

const BOUNDARIES = {
    twoDecimalBoundary: scale10(1, -2),
    sixDecimalBoundary: scale10(1, -6),
    eightDecimalBoundary: scale10(1, -8),
    twelveDecimalBoundary: scale10(1, -12),
    twoDecimalExp: 2,
    sixDecimalExp: 6,
    eightDecimalExp: 8,
    twelveDecimalExp: 12,
}

const DIGITAL_CURRENCY_SYMBOLS = {
    BTC: '\u20BF',
    ETH: '\u039E',
    SOL: '\u25CE',
    BNB: 'BNB',
    POLYGON: 'MATIC',
    WETH: 'WETH',
    AVAX: 'AVAX',
    GLMR: 'GLMR',
    MATIC: 'MATIC',
}

type UpperCaseKeys = keyof typeof DIGITAL_CURRENCY_SYMBOLS
type Keys = UpperCaseKeys | Lowercase<UpperCaseKeys>

const digitalCurrencyModifier = (parts: Intl.NumberFormatPart[], symbol: string, isDigitalCurrency: boolean) => {
    if (!isDigitalCurrency) return parts
    const [currencyPart, ...rest] = parts
    if (symbol) return [...rest, { ...currencyPart, value: symbol }]
    return parts
}

const formatCurrencySymbol = (symbol: string, isLead: boolean) => {
    return isLead || symbol.length === 0 ? symbol : ` ${symbol}`
}

const fiatCurrencySymbolModifier = (result: string, currency: LiteralUnion<Keys | 'USD'> = CurrencyType.USD) => {
    return currency === CurrencyType.HKD ? `HK${result}` : result
}

// https://mask.atlassian.net/wiki/spaces/MASK/pages/122916438/Token
export function formatCurrency(
    inputValue: BigNumber.Value,
    currency: LiteralUnion<Keys | 'USD'> = CurrencyType.USD,
    options?: FormatterCurrencyOptions,
): string {
    const { onlyRemainTwoDecimal = false, fiatCurrencyRate = 1, customDecimalConfig } = options ?? {}
    const bn = new BigNumber(inputValue).multipliedBy(fiatCurrencyRate)
    const integerValue = bn.integerValue(1)
    const decimalValue = bn.plus(integerValue.negated())
    const isMoreThanOrEqualToOne = bn.isGreaterThanOrEqualTo(1)

    const {
        sixDecimalBoundary,
        twoDecimalBoundary,
        twelveDecimalBoundary,
        eightDecimalBoundary,
        sixDecimalExp,
        twoDecimalExp,
        twelveDecimalExp,
    } = BOUNDARIES

    const symbol = currency ? DIGITAL_CURRENCY_SYMBOLS[currency.toUpperCase() as UpperCaseKeys] : ''

    let formatter: Intl.NumberFormat
    let isIntlCurrencyValid = !DIGITAL_CURRENCY_SYMBOLS[currency.toUpperCase() as UpperCaseKeys]

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

    const isDigitalCurrency = !!(!isIntlCurrencyValid && symbol)
    const digitalCurrencyModifierValues = digitalCurrencyModifier(
        formatter.formatToParts(
            bn.isZero() ? 0 : bn.lt(sixDecimalBoundary) ? sixDecimalBoundary.toNumber() : bn.toNumber(),
        ),
        symbol,
        isDigitalCurrency,
    )

    let result: string = ''

    if (
        bn.lt(customDecimalConfig?.boundary ?? onlyRemainTwoDecimal ? twoDecimalBoundary : sixDecimalBoundary) ||
        bn.isZero()
    ) {
        const isLessThanTwoDecimalBoundary = bn.lt(twoDecimalBoundary)
        const isLessThanTwelveDecimalBoundary = bn.lt(twelveDecimalBoundary)
        const isLessThanCustomDecimalBoundary = customDecimalConfig?.boundary
            ? bn.lt(customDecimalConfig?.boundary)
            : false
        const isGreatThanEightDecimalBoundary = bn.gte(eightDecimalBoundary)

        const value = digitalCurrencyModifierValues
            .map(({ type, value }, i) => {
                switch (type) {
                    case 'currency':
                        return formatCurrencySymbol(symbol ?? value, i === 0)
                    case 'fraction':
                        if (customDecimalConfig) {
                            return bn.isZero()
                                ? '0.00'
                                : isLessThanCustomDecimalBoundary
                                ? customDecimalConfig.boundary.toFixed()
                                : bn.toFixed(customDecimalConfig.decimalExp).replace(/0+$/, '')
                        }
                        return bn.isZero()
                            ? '0.00'
                            : onlyRemainTwoDecimal
                            ? '0.01'
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

        result = `${
            (isLessThanTwelveDecimalBoundary || (onlyRemainTwoDecimal && isLessThanTwoDecimalBoundary)) && !bn.isZero()
                ? '< '
                : ''
        }${value}`
    } else if (isMoreThanOrEqualToOne) {
        result = digitalCurrencyModifierValues
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
    } else {
        result = digitalCurrencyModifierValues
            .map(({ type, value }, i) => {
                switch (type) {
                    case 'currency':
                        return formatCurrencySymbol(symbol ?? value, i === 0)
                    case 'fraction':
                        const dec = decimalValue
                            .toFormat(
                                customDecimalConfig?.decimalExp ??
                                    (onlyRemainTwoDecimal ? twoDecimalExp : sixDecimalExp),
                            )
                            .replace(/\d\./, '')
                        return onlyRemainTwoDecimal ? dec.replace(/(\d\d)(0+)$/, '$1') : dec.replace(/(0+)$/, '')
                    case 'integer':
                        // When there is a carry
                        if (bn.gt('0.99') && onlyRemainTwoDecimal) return '1'
                        return '0'
                    case 'literal':
                        return ''
                    default:
                        return value
                }
            })
            .join('')
    }

    return fiatCurrencySymbolModifier(result, currency)
}
