import { BigNumber } from '@ethersproject/bignumber'
import type { PrefixedHexString } from 'ethereumjs-util'

// 32-byte buffer for hashes and 32-byte encoded strings
export interface Buffer32 extends Buffer {}
// 24-byte buffer for chain addresses and token definitions
export interface Buffer24 extends Buffer {}
// 24-byte buffer for chain addresses and token definitions
export interface Buffer20 extends Buffer {}

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

export type BufferTypes = Buffer | Buffer32 | Buffer24 | Buffer20
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
function buf(b: BufferTypes | Bytes | Uint8Array | HexTypes | number | BigIntTypes | BigNumber): Buffer {
    if (b === null) return b

    if (Buffer.isBuffer(b)) return b

    if (b instanceof Uint8Array) return Buffer.from(b)

    if (typeof b === 'number') {
        return Buffer.from(BigNumber.from(b).toHexString().slice(2), 'hex')
    }

    if (typeof b === 'bigint') return Buffer.from(toEvenLength(b.toString(16)), 'hex')

    if (typeof b === 'string') {
        if (!b.startsWith('0x')) throw new Error('unsupported')
        const hex = b.slice(2)
        if (hex.length % 2 !== 0 || !isHexString(b)) {
            // Buffer.from(hex, 'hex') will throw on invalid hex, should we do it?
            throw new Error('invalid hex string')
        }

        return Buffer.from(hex, 'hex')
    }

    // This should return the most compact buffer version without leading zeros, so safe for RLP encodings.
    if (b instanceof BigNumber || (b as any)?._isBigNumber === true)
        return Buffer.from((b as any).toHexString().slice(2), 'hex')

    throw new Error('unsupported: ')
}
export function toBigInt(b: BufferTypes | BigIntTypes | Uint8Array | HexTypes | number | BigNumber): bigint {
    if (typeof b === 'bigint') return b
    if (typeof b === 'number') return BigInt(b)
    if (b instanceof Buffer) return BigInt('0x' + b.toString('hex'))
    if (b instanceof Uint8Array) return toBigInt(buf(b))
    if (typeof b === 'string' && b.startsWith('0x')) return BigInt(b)
    if (b instanceof BigNumber || (b as any)?._isBigNumber === true) return (b as any).toBigInt() as bigint

    throw new Error('unsupported')
}
