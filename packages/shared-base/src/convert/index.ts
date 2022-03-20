import { Convert } from 'pvtsutils'

export function fromBase64URL(x: string) {
    return new Uint8Array(Convert.FromBase64Url(x))
}
export function toBase64URL(x: BufferSource) {
    return Convert.ToBase64Url(x)
}
export function toBase64(x: BufferSource) {
    return Convert.ToBase64(x)
}
export function toHex(x: BufferSource) {
    return Convert.ToHex(x)
}
export function fromHex(x: string) {
    if (x.startsWith('0x')) x = x.slice(2)
    return new Uint8Array(Convert.FromHex(x))
}
