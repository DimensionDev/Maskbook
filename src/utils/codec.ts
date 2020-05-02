/* eslint-disable no-bitwise */
import { BASE_1024, BASE_2048 } from './constants'
import { parse } from 'twemoji-parser'

/**
 * Single remapping Fn
 *
 * Join all elements into one string with mapping
 */
function reMapping(input: ArrayLike<string>, mapFn: (bytes: string, index: number) => string): string {
    return Array.from(input, mapFn).join('')
}

/**
 * Parsing codepoints to emoji strings
 */
function parseEmojis(points: string[]): string[] {
    return points
        .map((point: string) => {
            const mapFn = (hs: string) => String.fromCodePoint(Number.parseInt(hs, 16))
            return String(point.split('-').map(mapFn).join(''))
        })
        .sort((c: string, n: string) => c.length - n.length)
}

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
    name: string
    table: string[]
    tail: string
}

/**
 * Binary Encoding
 */
// prettier-ignore
export const Binary: CodecScheme = {
    bits: 1,
    name: "Binary",
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
    name: "Hex",
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
    name: "Base64",
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
 * BASE1024 Encoding
 */
export const BASE1024: CodecScheme = {
    bits: 10,
    name: 'Base1024',
    table: BASE_1024,
    tail: '=',
}

/**
 * BASE2048 Encoding
 */
export const BASE2048: CodecScheme = {
    bits: 11,
    name: 'Base2048',
    table: parseEmojis(BASE_2048),
    tail: '=',
}

/**
 * Assert `CodecSchema`
 *
 * - `bits` : should be `number`
 * - `table`: `length` of table should be `1 << bits`
 * - `tail` : should be `string`
 */
function assertScheme(scheme: CodecScheme) {
    // Assert bits
    if (typeof scheme.bits !== 'number') {
        throw new Error(`the bits field of ${scheme.name} should be type 'number'`)
    }

    // Assert table
    //
    // Emojis' combining characters needs full of them
    if (1 << scheme.bits > scheme.table.length) {
        throw new Error(`table \`length\` of ${scheme.name} should larger than ${1 << scheme.bits}`)
    }

    // Assert tail
    if (typeof scheme.tail !== 'string') {
        throw new Error(`the tail field of ${scheme.name} should be type 'string'`)
    }
}

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
 * For `UTF-16`: `[ 01001101, 01100001, 01110011, 01101011 ]`
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
 * @method  toHex    - Convert code points to hex string
 * @method  toBase64 - Convert code points to base64 string
 * @method  toString - Convert code points to utf-16 string
 */
export class Codec {
    /**
     * Build `Codec` from target scheme string
     *
     * @param  {CodecScheme} scheme - target codec scheme
     * @param  {string}      input  - the base `CodecScheme` string
     */
    static from(scheme: CodecScheme, input: string | string[], emoji: boolean = false): Codec {
        assertScheme(scheme)

        // Map bytes to binary string
        let bits: number = 0
        const mapFn = (byte: string) => {
            // return empty string if it is tail
            if (byte === scheme.tail) {
                bits += 2
                return ''
            }

            // throw error if out of range
            const index = scheme.table.indexOf(byte)
            if (index === -1) {
                throw new Error(`Decode from ${scheme.name} string failed`)
            }

            // Complete
            return String(('0'.repeat(scheme.bits - 1) + Number(index).toString(2)).slice(-scheme.bits))
        }

        // Check if need to parse emojis
        if (emoji) {
            const tails = String(input.slice(input.indexOf(scheme.tail)))
            input = parse(input as string).map((emoji: Record<string, any>) => emoji.text)
            input = input.concat(tails.split(''))
        }

        // Check if need reTrim last byte
        let binary: string = reMapping(input, mapFn)
        if (bits !== 0) {
            let lastByte = binary.slice(-scheme.bits)
            lastByte = lastByte.slice(lastByte.indexOf('1')) + lastByte.slice(0, lastByte.indexOf('1'))
            binary = binary.slice(0, -scheme.bits) + lastByte
        }

        // Return new codec
        return new Codec(binary.slice(0, bits > 0 ? -bits : binary.length))
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
     * Build `Codec` from emojis string
     *
     * @param {string} b1024 - b1024 string
     */
    static fromBase1024(b1024: string): Codec {
        return Codec.from(BASE1024, b1024, true)
    }

    /**
     * Build `Codec` from emojis string
     *
     * @param {string} b2048 - b2048 string
     */
    static fromBase2048(b2048: string): Codec {
        return Codec.from(BASE2048, b2048, true)
    }

    /**
     * Build `Codec` from binary string
     *
     * @param {string} binary - binary string
     */
    static fromBinary(binary: string): Codec {
        return new Codec(binary)
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
     * Build Codec from utf8 string
     *
     * @param {string} str - utf8 string
     */
    static fromUtf8(utf8: string): Codec {
        return new Codec(
            Array.from(utf8, (char: string) => {
                const point = char.codePointAt(0)
                if (point === undefined) {
                    throw new Error('Invalid character while parsing utf-8 string')
                }

                // Complete the 0 prefix from every byte
                return ('0'.repeat(8) + point.toString(2)).slice(-8)
            }).reduce((o: string, c: string) => (o += c)),
        )
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
        this.bin = String(binary)
    }

    /**
     * Convert points to hex
     */
    public toBinary(): string {
        return String(this.bin)
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
     * Convert points to hex
     */
    public toBase1024(): string {
        return this.toSchemeString(BASE1024)
    }

    /**
     * Convert points to hex
     */
    public toBase2048(): string {
        return this.toSchemeString(BASE2048)
    }

    /**
     * Convert codec binary to target scheme string
     *
     * @param {CodecScheme} scheme - target codec scheme
     *
     * @public This method can be used by manual `CodecSchema`.
     *
     * @return {string} scheme string
     */
    public toSchemeString(scheme: CodecScheme): string {
        assertScheme(scheme)

        // Match bytes in target schemem
        const bytes = this.bin.match(new RegExp(`.{1,${scheme.bits}}`, 'g'))
        if (bytes === null) {
            throw new Error('Can not convert to target codec scheme.')
        }

        // Fill the prefix for every byte
        let tails: number = 0
        const mapBytes = (byte: string): string => {
            if (byte.length !== scheme.bits) {
                const bits = scheme.bits - byte.length
                byte += '0'.repeat(bits)

                // calculating tails
                tails = bits / 2
            }

            return String(scheme.table[Number.parseInt(byte, 2)])
        }

        // Return codec string
        return String(reMapping(bytes, mapBytes) + scheme.tail.repeat(tails))
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
            bytes.map((byte: string) => Number.parseInt(byte, 2)),
        )
    }
}

// Export default
export default Codec
