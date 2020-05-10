/* eslint-disable no-bitwise */
import '../polyfill/codec'
import { BASE1024_SCHEMA } from './constants'

/**
 * Polyfill common codec stuffs
 *
 * + `Enconding` to `Uint8Array`
 * + `Uint8Array` to `Encoding`
 */
interface ICodecUtil {
    _atob: (data: string) => string
    _btoa: (data: string) => string
    // encoding
    bytesToHex: (data: Uint8Array) => string
    bytesToBase64: (data: Uint8Array) => string
    bytesToUtf8: (data: Uint8Array) => string
    bytesToBase1024: (data: Uint8Array) => string
    // decoding
    hexToBytes: (data: string) => Uint8Array
    base64ToBytes: (data: string) => Uint8Array
    utf8ToBytes: (data: string) => Uint8Array
    base1024ToBytes: (data: string) => Uint8Array
}

/**
 * Implement `CodecPolyFill` as `CodecUtil`
 */
export const CodecUtil: ICodecUtil = Object.freeze({
    _atob: (data: string): string => {
        return Buffer.from(data, 'base64').toString('utf-8')
    },
    _btoa: (data: string): string => {
        return Buffer.from(data, 'utf-8').toString('base64')
    },
    bytesToHex: (bytes: Uint8Array): string => {
        const reduceFn = (str: string, byte: number): string => {
            return str + Number(byte).toString(16).padStart(2, '0')
        }
        return bytes.reduce(reduceFn, '')
    },
    bytesToBase64: (bytes: Uint8Array): string => {
        return CodecUtil._btoa(new TextDecoder().decode(bytes))
    },
    bytesToUtf8: (bytes: Uint8Array): string => {
        return new TextDecoder().decode(bytes)
    },
    bytesToBase1024: (bytes: Uint8Array): string => {
        let result: string = ''
        for (let i = 0; i < bytes.length; i += 5) {
            const alpha = ((bytes[i] & 0xff) << 2) | (bytes[i + 1] >> 6)
            const beta = ((bytes[i + 1] & 0x3f) << 4) | (bytes[i + 2] >> 4)
            const gamma = ((bytes[i + 2] & 0xf) << 6) | (bytes[i + 3] >> 2)
            const delta = ((bytes[i + 3] & 0x3) << 8) | bytes[i + 4]
            result += [alpha, beta, gamma, delta]
                .map((char: number) => {
                    return BASE1024_SCHEMA.table[char]
                })
                .join('')
        }
        return result
    },
    hexToBytes: (data: string): Uint8Array => {
        const arr = data.match(/.{1,2}/g)
        if (arr === null) {
            return new Uint8Array()
        }
        return Uint8Array.from(arr.map((char: string) => parseInt(char, 16)))
    },
    base64ToBytes: (data: string): Uint8Array => {
        return new TextEncoder().encode(CodecUtil._atob(data))
    },
    utf8ToBytes: (data: string): Uint8Array => {
        return new TextEncoder().encode(data)
    },
    base1024ToBytes: (data: string): Uint8Array => {
        const source: number[] = Array.from(data, (char: string) => {
            return BASE1024_SCHEMA.table.indexOf(char)
        }).filter((n: number) => n !== -1)

        let bytes: number[] = []
        for (let i = 0; i < data.length; i += 4) {
            const alpha = source[i] >> 2
            const beta = ((source[i] & 0x3) << 6) | (source[i + 1] >> 4)
            const gamma = ((source[i + 1] & 0xf) << 4) | (source[i + 2] >> 6)
            const delta = ((source[i + 2] & 0x3f) << 2) | (source[i + 3] >> 8)
            const epsilon = source[i + 3] & 0xff
            bytes = bytes.concat([alpha, beta, gamma, delta, epsilon])
        }

        return Uint8Array.from(bytes)
    },
})

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
 * For `UTF-8`: `[ 01001101, 01100001, 01110011, 01101011 ]`
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
     * Build `Codec` from usc2 string string
     *
     * @param {string} usc2  - the common javascript `string`
     */
    static fromUtf8(utf8: string): Codec {
        return new Codec(CodecUtil.utf8ToBytes(utf8))
    }

    /**
     * Build `Codec` from hex string
     *
     * @param {string} hex - hex string
     */
    static fromHex(hex: string): Codec {
        return new Codec(CodecUtil.hexToBytes(hex))
    }

    /**
     * Build `Codec` from base64 string
     *
     * @param {string} b64 - base64 string
     */
    static fromBase64(b64: string): Codec {
        return new Codec(CodecUtil.base64ToBytes(b64))
    }

    /**
     * Build `Codec` from base1024 string
     *
     * @param {string} b1024 - base1024 string
     */
    static fromBase1024(b1024: string): Codec {
        return new Codec(CodecUtil.base1024ToBytes(b1024))
    }

    /**
     * `Codec` class is `Uint8Array` based
     */
    private bytes: Uint8Array

    /**
     * Generate `Codec` from `Uint8Array` directly
     *
     * @param {Uint8Array} bytes - construct Codec by bytes
     */
    constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }

    /**
     * Return the byte array
     *
     * @return {Uint8Array} - bytes
     */
    public toBytes(): Uint8Array {
        return this.bytes
    }

    /**
     * Encoding `Codec` source to hex string
     *
     * @return {string} - hex string
     */
    public toHex(): string {
        return CodecUtil.bytesToHex(this.bytes)
    }

    /**
     * Encoding `Codec` source to `base64` string
     *
     * @return {string} - base64 string
     */
    public toBase64(): string {
        return CodecUtil.bytesToBase64(this.bytes)
    }

    /**
     * Encoding `Codec` source to `base64` string
     *
     * @return {string} - base64 string
     */
    public toBase1024(): string {
        return CodecUtil.bytesToBase1024(this.bytes)
    }

    /**
     * Encoding `Codec` source to utf-8 string
     *
     * @return {string} - utf8 string
     */
    public toUtf8(): string {
        return CodecUtil.bytesToUtf8(this.bytes)
    }
}

// Export default
export default Codec
