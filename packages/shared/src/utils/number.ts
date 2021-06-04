import { BigNumber } from 'bignumber.js'

export function isZero(value: BigNumber.Value) {
    return new BigNumber(value).isZero()
}
