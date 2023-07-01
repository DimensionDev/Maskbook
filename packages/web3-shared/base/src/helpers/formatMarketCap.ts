import { BigNumber } from 'bignumber.js'
const boundaryValues = [
    {
        maxValue: 1000,
        symbol: '',
        shiftedBy: 0,
    },
    {
        maxValue: 1000000,
        symbol: 'k',
        shiftedBy: -3,
    },
    {
        maxValue: 1000000000,
        symbol: 'M',
        shiftedBy: -6,
    },
    {
        maxValue: 1000000000000,
        symbol: 'B',
        shiftedBy: -9,
    },
]

/**
 * format Market Cap
 * @returns format result
 * @param value
 * @param currency
 */
export function formatMarketCap(value: BigNumber.Value, currency = 'USD') {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
    const bgValue = new BigNumber(value)

    const boundary = boundaryValues.find(
        (x) =>
            bgValue.isLessThan(x.maxValue) &&
            !bgValue.shiftedBy(x.shiftedBy).decimalPlaces(2, BigNumber.ROUND_HALF_FLOOR).isEqualTo(1000),
    )

    if (boundary) {
        return (
            formatter.format(
                bgValue.shiftedBy(boundary.shiftedBy).decimalPlaces(2, BigNumber.ROUND_HALF_FLOOR).toNumber(),
            ) + boundary.symbol
        ).replace('.00', '')
    }

    return getCurrencySymbol(currency) + bgValue.decimalPlaces(2, BigNumber.ROUND_HALF_FLOOR).toExponential()
}

function getCurrencySymbol(currency: string) {
    return (0)
        .toLocaleString('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
        .replaceAll(/\d/g, '')
        .trim()
}
