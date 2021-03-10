import type BigNumber from 'bignumber.js'

/**
 * get the amount difference plus the % change in change itself (second order change)
 * @param valueNow
 * @param value24HoursAgo
 * @param value48HoursAgo
 */
export const get2DayPercentChange = (valueNow: BigNumber, value24HoursAgo: BigNumber, value48HoursAgo: BigNumber) => {
    const currentChange = valueNow.minus(value24HoursAgo)
    const previousChange = value24HoursAgo.minus(value48HoursAgo)

    const adjustedPercentChange = currentChange.minus(previousChange).dividedBy(previousChange).multipliedBy(100)

    if (adjustedPercentChange.isNaN() || !adjustedPercentChange.isFinite()) {
        return [currentChange, 0]
    }

    return [currentChange, adjustedPercentChange]
}

/**
 * get standard percent change between two values
 * @param valueNow
 * @param value24HoursAgo
 */
export const getPercentChange = (valueNow: BigNumber, value24HoursAgo: BigNumber) => {
    const adjustedPercentChange = valueNow.minus(value24HoursAgo).dividedBy(value24HoursAgo).multipliedBy(100)

    if (adjustedPercentChange.isNaN() || adjustedPercentChange.isFinite()) {
        return 0
    }
    return adjustedPercentChange
}
