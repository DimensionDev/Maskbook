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
interface CodecScheme {
    bits: number
    table: string[]
    tail: string
}

/**
 * Binary Encoding
 */
// prettier-ignore
export const Binary: CodecScheme = {
    bits: 1,
    table: [
        "0",
        "1",
    ],
    tail: "",
}

/**
 * Hex Encoding
 */
// prettier-ignore
export const HEX: CodecScheme = {
    bits: 4,
    table: [
        "0", "1", "2", "3",
        "4", "5", "6", "7",
        "8", "9", "a", "b",
        "c", "d", "e", "f",
    ],
    tail: "",
}

/**
 * Base64 Encoding
 */
// prettier-ignore
export const BASE64: CodecScheme = {
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
    tail: "=",
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
 * All data will be formated into binary while constructing Codec
 * class, for example, Let's format the word `Mask`:
 *
 * For `Base1024`:
 *
 * | Text |   Binary   | Index |
 * | ---- | ---------- | ----- |
 * |      | 0100110101 |  309  |
 * |      | 1000010111 |  535  |
 * |      | 0011011011 |  219  |
 *
 * For `ASCII`: `[ 01001101, 01100001, 01110011, 01101011 ]`
 *
 * | Text |  Binary  | Index |
 * | ---- | -------- | ----- |
 * |  M   | 01001101 |  77   |
 * |  a   | 01100001 |  97   |
 * |  s   | 01110011 |  115  |
 * |  k   | 01101011 |  107  |
 *
 * For `Base64`: `[ 010011, 010110, 000101, 110011, 011010, 11 ]`
 *
 * | Text | Binary | Index |
 * | ---- | ------ | ----- |
 * |  T   | 010011 |  19   |
 * |  W   | 010110 |  22   |
 * |  F   | 000101 |  5    |
 * |  z   | 110011 |  51   |
 * |  a   | 011010 |  26   |
 * |  s   | 110000 |  48   |
 * |  =   | 000000 |       |
 *
 * For `hex`: `[ 0100, 1101, 0110, 0001, 0111, 0011, 0110, 1011 ]`
 *
 * | Text | Binary | Index |
 * | ---- | ------ | ----- |
 * |  4   |  0100  |   4   |
 * |  d   |  1101  |   13  |
 * |  6   |  0110  |   6   |
 * |  1   |  0001  |   1   |
 * |  7   |  0111  |   7   |
 * |  3   |  0011  |   3   |
 * |  6   |  0110  |   6   |
 * |  b   |  1011  |   11  |
 *
 * @property {Point[]} points - Code points
 *
 * @method  toHex            - Convert code points to hex string
 * @method  toBase64         - Convert code points to base64 string
 * @method  toString         - Convert code points to utf-16 string
 */
export default class Codec {
    /**
     * Build `Codec` from target scheme string
     *
     * @param {CodecScheme} scheme - target codec scheme
     * @param {string}      str    - the base `CodecScheme` string
     */
    static from(scheme: CodecScheme, str: string): Codec {
        return new Codec(
            Array.from(str, (byte: string) => {
                const index = scheme.table.indexOf(byte)

                // return empty string if it is tail
                if (index === -1) {
                    return ''
                }

                return ('0'.repeat(scheme.bits - 1) + Number(index).toString(2)).slice(-scheme.bits)
            }).reduce((o: string, c: string) => (o += c)),
        )
    }

    /**
     * Build `Codec` from base64 string
     *
     * @param {string} b64 - base64 string
     */
    static fromBase64(b64: string): Codec {
        return Codec.from(BASE64, b64)
    }

    /**
     * Build `Codec` from hex string
     *
     * @param {string} str - hex string
     */
    static fromHex(hex: string): Codec {
        return Codec.from(HEX, hex)
    }

    /**
     * Build Codec from utf-16 string
     *
     * @param {string} str - utf16 string
     */
    static fromUtf16(str: string): Codec {
        return new Codec(
            Array.from(str, (char: string) => {
                const point = char.codePointAt(0)
                if (point === undefined) {
                    return '0'.repeat(8)
                }

                // Complete the 0 prefix from every byte
                return ('0'.repeat(8) + point.toString(2)).slice(-8)
            }).reduce((o: string, c: string) => (o += c)),
        )
    }

    /**
     * Convert code point into target radix string
     *
     * @name P2RS - Point to Radix String
     *
     * @param {CodecScheme} scheme      - target codec scheme
     * @param {Point}       point       - code point
     * @param {string}      str         - the output string
     * @param {boolean}     completion  - if complete the prefix
     */
    static P2RS(scheme: CodecScheme, point: Point, str: string, completion: boolean): [number, string] {
        if (point === undefined) {
            return [0, '']
        } else if (point === 0) {
            return [0, str]
        }

        // Complete prefix if it is required
        const reminder = completion
            ? (scheme.table[0].repeat(scheme.bits - 1) + scheme.table[point & ((1 << scheme.bits) - 1)]).slice(
                  -scheme.bits,
              )
            : scheme.table[point & ((1 << scheme.bits) - 1)]

        // Recursive result
        return this.P2RS(scheme, point >> scheme.bits, reminder + str, completion)
    }

    /**
     * Convert code points into target radix string
     *
     * @name Ps2RS - Points to Radix String
     *
     * @param {CodecScheme} scheme     - target codec scheme.
     * @param {Point[]}     points     - code points
     * @param {boolean}     completion - complete prefix
     */
    static Ps2RS(scheme: CodecScheme, points: Point[], completion: boolean): string {
        return points.map((point: Point) => Codec.P2RS(scheme, point, '', completion)[1]).reduce((o, c) => (o += c))
    }

    /**
     * This binary is converted from 8 bits points
     */
    private bin: string

    /**
     * Build Codec from binary string
     *
     * @param {string} binary - binary string
     */
    constructor(binary: string) {
        this.bin = binary
    }

    /**
     * Convert points to hex
     */
    public toBinary(): string {
        return this.bin
    }

    /**
     * Convert points to hex
     */
    public toHex(): string {
        return this.toSchemeString(HEX)
    }

    /**
     * Convert points to hex
     */
    public toBase64(): string {
        return this.toSchemeString(BASE64)
    }

    /**
     * Convert codec binary to target scheme string
     *
     * @param {CodecScheme} scheme - target codec scheme
     *
     * @public This method can be used by manual `CodecSchema`.
     *
     * @return {string} schema string
     */
    // prettier-ignore
    public toSchemeString(scheme: CodecScheme): string {
        const bytes = this.bin.match(new RegExp(`.{1,${scheme.bits}}`, "g"));
        if (bytes === null) {
            return "";
        }

        let tail: number = 0;
        return Array.from(bytes.map((
            byte: string
        ) => {
            if (byte.length !== scheme.bits) {
                tail = (scheme.bits - byte.length) / 2;
                return byte + "0".repeat(tail * 2);
            }
            return byte;
        }), (
            byte: string
        ) => scheme.table[parseInt(byte, 2)]).reduce((
            o: string, c: string
        ) => o += c) + scheme.tail.repeat(tail);
    }

    /**
     * Convert source binary to utf-16 string
     *
     * @return {string} string constructed by code points
     */
    public toString(): string {
        const bytes = this.bin.match(/.{1,8}/g)
        if (bytes === null) {
            return ''
        }

        // Return string from code points
        return String.fromCodePoint.apply(
            null,
            bytes.map((byte: string) => parseInt(byte, 2)),
        )
    }
}
