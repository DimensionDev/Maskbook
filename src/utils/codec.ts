/* eslint-disable no-bitwise */
/**
 * @file Codec
 * @name codec.ts<utils>
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
interface CodecSchema {
    bits: number
    table: string[]
}

/**
 * Binary Encoding
 */
// prettier-ignore
export const Binary: CodecSchema = {
    bits: 1,
    table: [
        "0",
        "1",
    ],
}

/**
 * Hex Encoding
 */
// prettier-ignore
export const HEX: CodecSchema = {
    bits: 4,
    table: [
        "0", "1", "2", "3",
        "4", "5", "6", "7",
        "8", "9", "a", "b",
        "c", "d", "e", "f",
    ],
}

/**
 * Base64 Encoding
 */
// prettier-ignore
export const BASE64: CodecSchema = {
    bits: 6,
    table: [
        "A", "B", "C", "D", "E", "F",
        "G", "H", "I", "J", "K", "L",
        "M", "N", "O", "P", "Q", "R",
        "S", "T", "U", "V", "W", "X",
        "Y", "Z", "a", "b", "c", "d",
        "e", "f", "g", "h", "i", "j",
        "k", "l", "m", "n", "o", "p",
        "q", "r", "s", "t", "u", "v",
        "w", "x", "y", "z", "0", "1",
        "2", "3", "4", "5", "6", "7",
        "8", "9", "+", "/"
    ],
}

/**
 * Unicode code points range: `0 - 0x10FFFF`.
 *
 * If there is no element at point, the value is `undefined`.
 */
type Point = number | undefined

/**
 * Codec
 *
 * Encoding/Decoding string with Unicode code points(0 - 0x10FFFF).
 *
 * @property {Point[]} points - Code points
 *
 * @method  toHex            - Convert code points to hex string
 * @method  toBase64         - Convert code points to base64 string
 * @method  toString         - Convert code points to utf-16 string
 */
export class Codec {
    /**
     * Points holder
     */
    private points: Point[]

    /**
     * Build Codec from utf-16 string
     */
    constructor(str: string) {
        this.points = Array.from(str, (char: string) => char.codePointAt(0))
    }

    /**
     * Convert points to hex
     */
    public toBinary(): string {
        return this._toString(Binary)
    }

    /**
     * Convert points to hex
     */
    public toHex(): string {
        return this._toString(HEX)
    }

    /**
     * Convert points to hex
     */
    public toBase64(): string {
        return this._toString(BASE64)
    }

    /**
     * Convert code points back to utf-16
     */
    public toString(): string {
        return String.fromCodePoint.apply(
            null,
            this.points.map((point: Point) => (point ? point : 0)),
        )
    }

    /**
     * Convert code point into target schema string
     *
     * @param {CodecSchema} schema - target codec schema
     * @param {Point} point - code point
     * @param {string} str - the output string
     */
    private _into(schema: CodecSchema, point: Point, str: string): [number, string] {
        if (point === undefined) {
            return [0, '']
        } else if (point === 0) {
            return [0, str]
        }

        return this._into(schema, point >> schema.bits, schema.table[point & ((1 << schema.bits) - 1)] + str)
    }

    /**
     * Convert code points to target schema string
     *
     * @param {CodecSchema} schema - target codec schema.
     */
    private _toString(schema: CodecSchema): string {
        return this.points.map((point: Point) => this._into(schema, point, '')[1]).reduce((o, c) => (o += c))
    }
}
