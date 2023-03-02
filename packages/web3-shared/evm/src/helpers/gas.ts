import { BigNumber } from 'bignumber.js'

export function addGasMargin(value: BigNumber.Value, scale = 3000) {
    return new BigNumber(value).multipliedBy(new BigNumber(10_000).plus(scale)).dividedToIntegerBy(10_000)
}
