import BigNumber from 'bignumber.js'

export const ZERO = new BigNumber('0')
export const ONE = new BigNumber('1')

/** if abs(n) < m then return 0 */
export function toZero(n: BigNumber.Value, m = 1e-6) {
    const n_ = new BigNumber(n)
    return n_.abs().isLessThanOrEqualTo(m) ? ZERO : n_
}

/** n === 0 */
export function isZero(n: BigNumber.Value) {
    return n === 0 || n === '0' || new BigNumber(n).isZero()
}

/** n === 1 */
export function isOne(n: BigNumber.Value) {
    return n === 1 || n === '1' || new BigNumber(n).isEqualTo(ONE)
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

/** a > 0 */
export function isPositive(n: BigNumber.Value) {
    return new BigNumber(n).isPositive()
}

/** a * b */
export function multipliedBy(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).multipliedBy(b)
}

/** a - b */
export function minus(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).minus(b)
}

/** 10 ** n */
/** @deprecated use scale10 */
export function pow10(n: BigNumber.Value) {
    return new BigNumber(10).pow(n)
}

/** scale 10 ** n * m */
export function scale10(m: BigNumber.Value, n = 1) {
    const x = new BigNumber(1).shiftedBy(n)
    return n === 1 ? x : x.multipliedBy(m)
}

/** n * (10 ** m) */
export function rightShift(n: BigNumber.Value, m: number | undefined | null) {
    return new BigNumber(n).shiftedBy(+(m ?? 0))
}

/** n / (10 ** m) */
export function leftShift(n: BigNumber.Value, m: number | undefined | null) {
    return new BigNumber(n).shiftedBy(-(m ?? 0))
}

/** a / b */
export function dividedBy(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).dividedBy(b)
}

export function toFixed(value: BigNumber.Value | undefined): string
export function toFixed(value: BigNumber.Value | undefined, decimalPlaces: number): string
export function toFixed(value: BigNumber.Value = 0, decimalPlaces?: number) {
    const n = new BigNumber(value)
    return decimalPlaces ? n.toFixed(decimalPlaces) : n.toFixed()
}
