import BigNumber from 'bignumber.js'

export function formatBigValue(
    value: BigNumber.Value,
    decimals = 4,
    defaultValue = '-',
    minDecimals: number | undefined = undefined,
): string {
    value = new BigNumber(value)
    if (value === undefined) {
        return defaultValue
    }

    const bnValue = new BigNumber(value)

    if (bnValue.isNaN()) {
        return defaultValue
    }

    return new BigNumber(bnValue.toFixed(decimals)).toFormat(minDecimals)
}

export function formatUSDValue(value: BigNumber.Value, decimals = 2, minDecimals = decimals): string {
    value = new BigNumber(value)
    if (value === undefined) {
        return '-'
    }

    const val = BigNumber.isBigNumber(value) ? value : new BigNumber(value)
    const formattedValue = formatBigValue(val.abs(), decimals, '-', minDecimals)

    return val.isPositive() ? `$${formattedValue}` : `-$${formattedValue}`
}
