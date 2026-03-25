import { Convert } from 'pvtsutils'
import { toHex as viem_toHex, type ByteArray } from 'viem'

export function fromBase64URL(x: string) {
    return new Uint8Array(Convert.FromBase64Url(x))
}

export function toBase64URL(x: BufferSource) {
    return Convert.ToBase64Url(x)
}

export function toBase64(x: BufferSource) {
    return Convert.ToBase64(x)
}

export function toHex(value: string | number | bigint | boolean | ByteArray) {
    if (typeof value === 'string') {
        // convert hex to number first, to normalize hex like 0x02 to 0x2
        if (/^\d+$/u.test(value) || /^0x[0-9a-fA-F]+$/u.test(value)) return viem_toHex(BigInt(value))
    }
    return viem_toHex(value)
}

export function fromHex(x: string) {
    if (x.startsWith('0x')) x = x.slice(2)
    return new Uint8Array(Convert.FromHex(x))
}
