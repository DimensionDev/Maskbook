import { BigNumber } from 'bignumber.js'

export const ZERO = new BigNumber('0')
export const ONE = new BigNumber('1')

/** value == 0 */
export function isZero(value: BigNumber.Value) {
    return value === 0 || value === '0' || new BigNumber(value).isZero()
}

/** a > b */
export function isGreaterThan(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isGreaterThan(b)
}

/** a < b */
export function isLessThan(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isLessThan(b)
}

/** 10 ** n */
export function pow10(n: BigNumber.Value, m?: BigNumber.Value) {
    return new BigNumber(10).pow(n, m)
}

/** x ** n */
export function getExponentValue(decimals = 0): BigNumber {
    return new BigNumber(10).pow(decimals)
}
