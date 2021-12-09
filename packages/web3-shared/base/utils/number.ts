import BigNumber from 'bignumber.js'

export const ZERO = new BigNumber('0')
export const ONE = new BigNumber('1')

/** n === 0 */
export function isZero(n: BigNumber.Value) {
    return n === 0 || n === '0' || new BigNumber(n).isZero()
}

/** a > b */
export function isGreaterThan(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isGreaterThan(b)
}

/** a >= b */
export function isGreaterThanOrEqualTo(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isGreaterThanOrEqualTo(b)
}

/** a < b */
export function isLessThan(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isLessThan(b)
}

/** a <= b */
export function isLessThanOrEqualTo(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isLessThanOrEqualTo(b)
}

export function isPositive(n: BigNumber.Value) {
    return new BigNumber(n).isPositive()
}

export function multipliedBy(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).multipliedBy(b)
}

/** 10 ** n */
export function pow10(n: BigNumber.Value) {
    return new BigNumber(10).pow(n)
}

/** n << m */
export function rightShift(n: BigNumber.Value, m: number | undefined | null) {
    return new BigNumber(n).shiftedBy(+(m ?? 0))
}

/** n >> m */
export function leftShift(n: BigNumber.Value, m: number | undefined | null) {
    return new BigNumber(n).shiftedBy(-(m ?? 0))
}
