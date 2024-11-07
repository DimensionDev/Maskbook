import { BigNumber } from 'bignumber.js'

export function addGasMargin(value: BigNumber.Value, scale = 0.3) {
    return new BigNumber(value).multipliedBy(1 + scale).toFixed(0)
}
