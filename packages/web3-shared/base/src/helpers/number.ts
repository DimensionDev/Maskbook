import { BigNumber } from 'bignumber.js'
import { isUndefined, trimEnd } from 'lodash-es'

export const ZERO = new BigNumber('0')
export const ONE = new BigNumber('1')

/** n === 0 */
export function isZero(n: BigNumber.Value) {
    return n === 0 || n === '0' || n === '0x0' || new BigNumber(n).isZero()
}

/** n === m */
export function isEqual(n: BigNumber.Value, m: BigNumber.Value) {
    return new BigNumber(n).isEqualTo(m)
}

/** a > b */
export function isGreaterThan(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isGreaterThan(b)
}

/** a >= b */
function isGreaterThanOrEqualTo(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isGreaterThanOrEqualTo(b)
}
export { isGreaterThanOrEqualTo, isGreaterThanOrEqualTo as isGte }

/** a < b */
export function isLessThan(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).isLessThan(b)
}

/** a * b */
export function multipliedBy(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).multipliedBy(b)
}

/** a + b */
export function plus(a: BigNumber.Value, b: BigNumber.Value) {
    return new BigNumber(a).plus(b)
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

/** new BigNumber(n).toNumber() */
export function toNumber(value?: BigNumber.Value, fallback = 0) {
    return new BigNumber(value ?? fallback).toNumber()
}

export function toFixed(value: BigNumber.Value | undefined): string
export function toFixed(value: BigNumber.Value | undefined, decimalPlaces: number): string
export function toFixed(value: BigNumber.Value = 0, decimalPlaces?: number) {
    const n = new BigNumber(value)
    return !isUndefined(decimalPlaces) ? n.toFixed(decimalPlaces) : n.toFixed()
}

/** Trim ending zeros of decimals */
export function trimZero(digit: string) {
    const result = digit.replaceAll(/\.([1-9]*)?0+$/g, (_, p1) => {
        return p1 ? `.${p1}` : ''
    })

    if (isLessThan(result, 1)) {
        return trimEnd(result, '0')
    }

    return result
}

export function addThousandSeparators(num: string | number) {
    try {
        return num.toString().replaceAll(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
    } catch (err) {
        // Safari doesn't support regexp look behind yet
        const value = typeof num === 'number' ? num : Number.parseFloat(num)
        return value.toLocaleString('en-US')
    }
}
