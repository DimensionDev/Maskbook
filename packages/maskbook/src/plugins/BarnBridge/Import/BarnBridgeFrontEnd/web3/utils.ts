import BigNumber from 'bignumber.js'

export function formatBigValue(value: BigNumber.Value, decimals = 4, defaultValue = '-', minDecimals?: number): string {
    value = new BigNumber(value)

    if (value.isNaN()) {
        return defaultValue
    }
    return new BigNumber(value.toFixed(decimals)).toFormat(minDecimals)
}

export function formatUSDValue(value: BigNumber.Value, decimals = 2, minDecimals = decimals): string {
    value = new BigNumber(value)

    const symbol = value.isPositive() ? '$' : '-$'
    return symbol + formatBigValue(value.abs(), decimals, '-', minDecimals)
}
