/**
 * @file Codec
 * @name codec.ts<constants>
 * @description |
 *
 *    |    base    |  bitwise  |  bits  |
 *    | ---------- | --------- | ------ |
 *    |    16      |  1 << 4   |   4    |
 *    |    64      |  1 << 6   |   6    |
 *    |    256     |  1 << 8   |   8    |
 *    |    1024    |  1 << 10  |   10   |
 *
 */
import EMOJIS from './emojis'

/**
 * Parse points to emojis
 *
 * Will be deprecated in next commit
 */
export function parseEmojis(points: string[]): string[] {
    return points
        .map((point: string) => {
            const mapFn = (hs: string) => String.fromCodePoint(Number.parseInt(hs, 16))
            return point.split('-').map(mapFn).join('')
        })
        .sort((c: string, n: string) => c.length - n.length)
}

/**
 * `CodecSchema` is a schema of `Codec` LOL
 *
 * @param {number} bits - bit digits
 * @param {string[]} table - char map
 * @param {string}   tail  - empty char
 */
export interface CodecScheme {
    bits: number
    table: string[]
    tail: string
}

/**
 * Hex Encoding
 */
// prettier-ignore
export const HEX_SCHEMA: CodecScheme = Object.freeze({
    bits: 4,
    table: [
        "0", "1", "2", "3",
        "4", "5", "6", "7",
        "8", "9", "a", "b",
        "c", "d", "e", "f",
    ],
    tail: "",
});

/**
 * BASE1024 Encoding
 */
export const BASE1024_SCHEMA: CodecScheme = Object.freeze({
    bits: 10,
    table: parseEmojis(EMOJIS),
    tail: '=',
})
