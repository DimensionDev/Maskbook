import { Convert } from 'pvtsutils'
import { toHex as viem_toHex, type ByteArray, type Hex } from 'viem'

export function fromBase64URL(x: string) {
    return new Uint8Array(Convert.FromBase64Url(x))
}

export function toBase64URL(x: BufferSource) {
    return Convert.ToBase64Url(x)
}

export function toBase64(x: BufferSource) {
    return Convert.ToBase64(x)
}

export function toHex(value: string | number | bigint | boolean | ByteArray): Hex {
    if (typeof value === 'string') {
        if (/^0x[0-9a-fA-F]+$/u.test(value)) return value as Hex
        if (/^\d+$/u.test(value)) return viem_toHex(BigInt(value))
    }
    return viem_toHex(value)
}

export function toBigInt(value: string | number | bigint | boolean | ByteArray): bigint {
    if (typeof value === 'bigint') return value
    if (typeof value === 'number') return BigInt(value)
    if (typeof value === 'string') {
        if (/^0x[0-9a-fA-F]+$/u.test(value)) return BigInt(value)
        if (/^\d+$/u.test(value)) return BigInt(value)
    }
    return BigInt(viem_toHex(value))
}

export function fromHex(x: string) {
    if (x.startsWith('0x')) x = x.slice(2)
    return new Uint8Array(Convert.FromHex(x))
}
