import BigNumber from 'bignumber.js'

type Value = string | number | BigNumber | undefined

/**
 * get standard percent change between two values
 * @param valueNow
 * @param value24HoursAgo
 */
export const getPercentChange = (valueNow: Value, value24HoursAgo: Value) => {
    const adjustedPercentChange = new BigNumber(valueNow ?? 0)
        .minus(value24HoursAgo ?? 0)
        .dividedBy(value24HoursAgo ?? 0)
        .multipliedBy(100)

    if (adjustedPercentChange.isNaN() || adjustedPercentChange.isFinite()) {
        return 0
    }
    return adjustedPercentChange.toNumber()
}
