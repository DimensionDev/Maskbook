import BigNumber from 'bignumber.js'
import type { PrefixedHexString } from 'ethereumjs-util'

// Never used class to force ts compiler to hide the underlying alias type.
class TypeStub {
    constructor() {}
}

type Uint32 = bigint | TypeStub
// 32-byte hex-encoded string
type Hex32 = string | TypeStub
// 24-byte hex-encoded string
type Hex24 = string | TypeStub
// 20-byte hex-encoded string
type Hex20 = string | TypeStub

export type HexTypes = PrefixedHexString | Hex32 | Hex24 | Hex20
export type BigIntTypes = bigint | Uint32

type Bytes = ArrayLike<number>

function toEvenLength(str: string): string {
    if (str.length % 2 !== 0) {
        return '0' + str
    }
    return str
}
function isHexString(value: string): boolean {
    return !!value.match(/^0x[\dA-Fa-f]*$/)
}

export function hexToArrayBuffer(input: string) {
    if (input.length % 2 !== 0) {
        throw new RangeError('Expected string to be an even number of characters')
    }

    const view = new Uint8Array(input.length / 2)

    for (let i = 0; i < input.length; i += 2) {
        view[i / 2] = Number.parseInt(input.slice(i, i + 2), 16)
    }
    return view
}

export function writeUInt32BE(buf: Uint8Array, value: number, offset?: number) {
    if (value < 0 || value >= Number.MAX_SAFE_INTEGER) {
        throw new RangeError(`value must be >= 0 and <= ${Number.MAX_SAFE_INTEGER - 1}. Received ${value}`)
    }
    // eslint-disable-next-line no-bitwise
    buf.set([value >>> 24, value >>> 16, value >>> 8, value & 0xff], offset)

    return buf
}

function buf(b: Bytes | Uint8Array | HexTypes | number | BigIntTypes | BigNumber): Uint8Array {
    if (b === null || b instanceof Uint8Array) return b

    if (typeof b === 'number') {
        return hexToArrayBuffer(new BigNumber(b).toString(16).slice(2))
    }

    if (typeof b === 'bigint') return hexToArrayBuffer(toEvenLength(b.toString(16)))

    if (typeof b === 'string') {
        if (!b.startsWith('0x')) throw new Error('unsupported')
        const hex = b.slice(2)
        if (hex.length % 2 !== 0 || !isHexString(b)) {
            throw new Error('invalid hex string')
        }

        return hexToArrayBuffer(hex)
    }

    // This should return the most compact buffer version without leading zeros, so safe for RLP encodings.
    if (b instanceof BigNumber || (b as any)?._isBigNumber === true)
        return hexToArrayBuffer((b as any).toHexString().slice(2))

    throw new Error('unsupported: ')
}
export function toBigInt(b: BigIntTypes | Uint8Array | HexTypes | number | BigNumber): bigint {
    if (typeof b === 'bigint') return b
    if (typeof b === 'number') return BigInt(b)
    if (b instanceof Uint8Array) return toBigInt(buf(b))
    if (typeof b === 'string' && b.startsWith('0x')) return BigInt(b)
    if (b instanceof BigNumber || (b as any)?._isBigNumber === true) return BigInt(b.toString())

    throw new Error('unsupported')
}
