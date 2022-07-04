import { decodeArrayBuffer, encodeArrayBuffer } from '@dimensiondev/kit'
import { None, Option, Some } from 'ts-results'
/** @internal */
export function sharedEncoder(input: Uint8Array): string {
    return `\u{1F3BC}6/8|${encodeArrayBuffer(input)}:||`
}

/** @internal */
export function sharedDecoder(input: string): Option<Uint8Array> {
    const [, payload] = input.match(/\u{1F3BC}6\/8\|(\w+):\|\|/giu) || []
    if (!payload) return None
    try {
        return Some(new Uint8Array(decodeArrayBuffer(payload)))
    } catch {
        return None
    }
}
