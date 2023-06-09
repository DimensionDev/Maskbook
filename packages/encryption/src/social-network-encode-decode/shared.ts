import { decodeArrayBuffer, encodeArrayBuffer } from '@masknet/kit'
import { None, type Option, Some } from 'ts-results-es'
/** @internal */
export function sharedEncoder(input: Uint8Array): string {
    return `\u{1F3BC}6/8|${encodeArrayBuffer(input)}:||`
}

/** @internal */
export function sharedDecoder(input: string): Option<Uint8Array> {
    const [[, payload] = []] = input.matchAll(/\u{1F3BC}6\/8\|([\w+/=]+):\|\|/giu)
    if (!payload) return None
    try {
        return Some(new Uint8Array(decodeArrayBuffer(payload)))
    } catch {
        return None
    }
}
