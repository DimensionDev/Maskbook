import type { BigNumber } from 'bignumber.js'
import { multipliedBy } from './number.js'

export function formatPercentage(value: BigNumber.Value) {
    const percentage = multipliedBy(value, 100)
        .toFixed(2)
        .replace(/\.?0+$/, '')
    return `${percentage}%`
}
