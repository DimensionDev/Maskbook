/* eslint-disable no-plusplus */
/**
 * @packageDocumentation
 * @module harmony-crypto
 * @hidden
 */

// This file is ported from ether.js/src.ts/utils/bytes.ts
// and done some fixes

import * as errors from './errors'

export type Arrayish = string | ArrayLike<number>

export interface Hexable {
    toHexString(): string
}

export interface Signature {
    r: string
    s: string

    /* At least one of the following MUST be specified; the other will be derived */
    recoveryParam?: number
    v?: number
}

/// ////////////////////////////

export function isHexable(value: any): value is Hexable {
    return !!value.toHexString
}

function addSlice(array: Uint8Array): Uint8Array {
    if (typeof array === 'object' && typeof array.slice === 'function') {
        return array
    }

    // tslint:disable-next-line: only-arrow-functions
    array.slice = function () {
        const args = Array.prototype.slice.call(arguments)
        return addSlice(new Uint8Array(Array.prototype.slice.apply(array, [args[0], args[1]])))
    }

    return array
}

export function isArrayish(value: any): value is Arrayish {
    if (
        !value ||
        // tslint:disable-next-line: radix
        Number.parseInt(String(value.length), 10) !== value.length ||
        typeof value === 'string'
    ) {
        return false
    }

    // tslint:disable-next-line: prefer-for-of
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < value.length; i++) {
        const v = value[i]
        // tslint:disable-next-line: radix
        if (v < 0 || v >= 256 || Number.parseInt(String(v), 10) !== v) {
            return false
        }
    }

    return true
}

export function arrayify(value: Arrayish | Hexable): Uint8Array | null {
    if (value === null) {
        errors.throwError('cannot convert null value to array', errors.INVALID_ARGUMENT, {
            arg: 'value',
            value,
        })
    }

    if (isHexable(value)) {
        value = value.toHexString()
    }

    if (typeof value === 'string') {
        const match = value.match(/^(0x)?[\dA-Fa-f]*$/)

        if (!match) {
            errors.throwError('invalid hexidecimal string', errors.INVALID_ARGUMENT, {
                arg: 'value',
                value,
            })
        }

        if (match !== null && match[1] !== '0x') {
            errors.throwError('hex string must have 0x prefix', errors.INVALID_ARGUMENT, {
                arg: 'value',
                value,
            })
        }

        value = value.substring(2)
        if (value.length % 2) {
            value = '0' + value
        }

        const result = []
        for (let i = 0; i < value.length; i += 2) {
            result.push(Number.parseInt(value.substr(i, 2), 16))
        }

        return addSlice(new Uint8Array(result))
    }

    if (isArrayish(value)) {
        return addSlice(new Uint8Array(value))
    }

    errors.throwError('invalid arrayify value', null, {
        arg: 'value',
        value,
        type: typeof value,
    })
}

export function concat(objects: Arrayish[]): Uint8Array {
    if (objects === null) {
        throw new Error('concat objects is null')
    }
    const arrays = []
    let length = 0
    // tslint:disable-next-line: prefer-for-of
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < objects.length; i++) {
        const object = arrayify(objects[i])
        if (object == null) {
            throw new Error('arrayify failed')
        }
        arrays.push(object)
        length += object.length
    }

    const result = new Uint8Array(length)
    let offset = 0
    // tslint:disable-next-line: prefer-for-of
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < arrays.length; i++) {
        result.set(arrays[i], offset)
        offset += arrays[i].length
    }

    return addSlice(result)
}

export function stripZeros(value: Arrayish): Uint8Array {
    let result: Uint8Array | null = arrayify(value)

    if (result === null) {
        throw new Error('arrayify failed')
    }

    if (result.length === 0) {
        return result
    }

    // Find the first non-zero entry
    let start = 0
    while (result[start] === 0) {
        start++
    }

    // If we started with zeros, strip them
    if (start) {
        result = result.slice(start)
    }

    return result
}

export function padZeros(value: Arrayish, length: number): Uint8Array {
    const arrayifyValue = arrayify(value)
    if (arrayifyValue === null) {
        throw new Error('arrayify failed')
    }
    if (length < arrayifyValue.length) {
        throw new Error('cannot pad')
    }

    const result = new Uint8Array(length)
    result.set(arrayifyValue, length - arrayifyValue.length)
    return addSlice(result)
}

export function isHexString(value: any, length?: number): boolean {
    if (typeof value !== 'string' || !value.match(/^0x[\dA-Fa-f]*$/)) {
        return false
    }
    if (length && value.length !== 2 + 2 * length) {
        return false
    }
    return true
}

const HexCharacters = '0123456789abcdef'

export function hexlify(value: Arrayish | Hexable | number): string {
    if (isHexable(value)) {
        return value.toHexString()
    }

    if (typeof value === 'number') {
        if (value < 0) {
            errors.throwError('cannot hexlify negative value', errors.INVALID_ARGUMENT, {
                arg: 'value',
                value,
            })
        }

        // @TODO: Roll this into the above error as a numeric fault (overflow); next version, not backward compatible
        // We can about (value == MAX_INT) to as well, since that may indicate we underflowed already
        if (value >= 9007199254740991) {
            errors.throwError('out-of-range', errors.NUMERIC_FAULT, {
                operartion: 'hexlify',
                fault: 'out-of-safe-range',
            })
        }

        let hex = ''
        while (value) {
            hex = HexCharacters[value & 0x0f] + hex
            value = Math.floor(value / 16)
        }

        if (hex.length) {
            if (hex.length % 2) {
                hex = '0' + hex
            }
            return '0x' + hex
        }

        return '0x00'
    }

    if (typeof value === 'string') {
        const match = value.match(/^(0x)?[\dA-Fa-f]*$/)

        if (!match) {
            errors.throwError('invalid hexidecimal string', errors.INVALID_ARGUMENT, {
                arg: 'value',
                value,
            })
        }

        if (match !== null && match[1] !== '0x') {
            errors.throwError('hex string must have 0x prefix', errors.INVALID_ARGUMENT, {
                arg: 'value',
                value,
            })
        }

        if (value.length % 2) {
            value = '0x0' + value.substring(2)
        }
        return value
    }

    if (isArrayish(value)) {
        const result = []
        // tslint:disable-next-line: prefer-for-of
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        // eslint-disable-next-line no-plusplus
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < value.length; i++) {
            const v = value[i]
            // eslint-disable-next-line no-bitwise
            result.push(HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f])
        }
        return '0x' + result.join('')
    }

    errors.throwError('invalid hexlify value', null, {
        arg: 'value',
        value,
    })
}

export function hexDataLength(data: string) {
    if (!isHexString(data) || data.length % 2 !== 0) {
        return null
    }
    return (data.length - 2) / 2
}

export function hexDataSlice(data: string, offset: number, endOffset?: number): string {
    if (!isHexString(data)) {
        errors.throwError('invalid hex data', errors.INVALID_ARGUMENT, {
            arg: 'value',
            value: data,
        })
    }
    if (data.length % 2 !== 0) {
        errors.throwError('hex data length must be even', errors.INVALID_ARGUMENT, {
            arg: 'value',
            value: data,
        })
    }
    offset = 2 + 2 * offset

    if (endOffset != null) {
        return '0x' + data.substring(offset, 2 + 2 * endOffset)
    }

    return '0x' + data.substring(offset)
}

export function hexStripZeros(value: string): string {
    if (!isHexString(value)) {
        errors.throwError('invalid hex string', errors.INVALID_ARGUMENT, {
            arg: 'value',
            value,
        })
    }
    while (value.length > 3 && value.startsWith('0x0')) {
        value = '0x' + value.substring(3)
    }
    return value
}

export function hexZeroPad(value: string, length: number): string {
    if (!isHexString(value)) {
        errors.throwError('invalid hex string', errors.INVALID_ARGUMENT, {
            arg: 'value',
            value,
        })
    }

    while (value.length < 2 * length + 2) {
        value = '0x0' + value.substring(2)
    }
    return value
}

export function bytesPadLeft(value: string, byteLength: number): string {
    if (!isHexString(value)) {
        errors.throwError('invalid hex string', errors.INVALID_ARGUMENT, {
            arg: 'value',
            value,
        })
    }

    const striped = value.substring(2)
    if (striped.length > byteLength * 2) {
        throw new Error(`hex string length = ${striped.length} beyond byteLength=${byteLength}`)
    }
    const padLength = byteLength * 2 - striped.length
    const returnValue = '0x' + '0'.repeat(padLength) + striped
    return returnValue
}
export function bytesPadRight(value: string, byteLength: number): string {
    if (!isHexString(value)) {
        errors.throwError('invalid hex string', errors.INVALID_ARGUMENT, {
            arg: 'value',
            value,
        })
    }

    const striped = value.substring(2)
    if (striped.length > byteLength * 2) {
        throw new Error(`hex string length = ${striped.length} beyond byteLength=${byteLength}`)
    }
    const padLength = byteLength * 2 - striped.length
    const returnValue = '0x' + striped + '0'.repeat(padLength)
    return returnValue
}

export function isSignature(value: any): value is Signature {
    return value && value.r != null && value.s != null
}

export function splitSignature(signature: Arrayish | Signature): Signature {
    if (signature !== undefined) {
        let v = 0
        let r = '0x'
        let s = '0x'

        if (isSignature(signature)) {
            if (signature.v == null && signature.recoveryParam == null) {
                errors.throwError('at least on of recoveryParam or v must be specified', errors.INVALID_ARGUMENT, {
                    argument: 'signature',
                    value: signature,
                })
            }
            r = hexZeroPad(signature.r, 32)
            s = hexZeroPad(signature.s, 32)

            v = signature.v || 0
            if (typeof v === 'string') {
                v = Number.parseInt(v, 16)
            }

            let recoveryParam = signature.recoveryParam || 0
            if (recoveryParam === null && signature.v !== null) {
                recoveryParam = 1 - (v % 2)
            }
            v = 27 + recoveryParam
        } else {
            const bytes: Uint8Array = arrayify(signature) || new Uint8Array()
            if (bytes.length !== 65) {
                throw new Error('invalid signature')
            }
            r = hexlify(bytes.slice(0, 32))
            s = hexlify(bytes.slice(32, 64))

            v = bytes[64]
            if (v !== 27 && v !== 28) {
                v = 27 + (v % 2)
            }
        }

        return {
            r,
            s,
            recoveryParam: v - 27,
            v,
        }
    } else {
        throw new Error('signature is not found')
    }
}

export function joinSignature(signature: Signature): string {
    signature = splitSignature(signature)

    return hexlify(concat([signature.r, signature.s, signature.recoveryParam ? '0x1c' : '0x1b']))
}

/**
 * hexToByteArray
 *
 * Convers a hex string to a Uint8Array
 *
 * @param {string} hex
 * @returns {Uint8Array}
 */
export const hexToByteArray = (hex: string): Uint8Array => {
    const res = new Uint8Array(hex.length / 2)

    for (let i = 0; i < hex.length; i += 2) {
        res[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16)
    }

    return res
}

/**
 * hexToIntArray
 *
 * @param {string} hex
 * @returns {number[]}
 */
export const hexToIntArray = (hex: string): number[] => {
    if (!hex || !isHex(hex)) {
        return []
    }

    const res = []

    for (let i = 0; i < hex.length; i++) {
        const c = hex.charCodeAt(i)
        // eslint-disable-next-line no-bitwise
        const hi = c >> 8
        // eslint-disable-next-line no-bitwise
        const lo = c & 0xff

        hi ? res.push(hi, lo) : res.push(lo)
    }

    return res
}

/**
 * isHex
 *
 * @param {string} str - string to be tested
 * @returns {boolean}
 */
export const isHex = (str: string): boolean => {
    const plain = str.replace('0x', '')
    return /[\da-f]*$/i.test(plain)
}
