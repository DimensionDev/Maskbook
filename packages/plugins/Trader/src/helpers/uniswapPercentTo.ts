import { BigNumber } from 'bignumber.js'
import type { Percent } from '@uniswap/sdk-core'

export function uniswapPercentTo(percent: Percent) {
    return new BigNumber(percent.toFixed(2)).dividedBy(100)
}
