/**
 * @file Codec
 * @name codec.ts<utils>
 * @description |
 *
 *    Encoding base to emoji and converting to any formats.
 *
 *    Every time you import this file will auto-calcuting all emojis
 *    instead of a big constants file.
 */
export const ALL_EMOJIS: string[] = (function () {
    const range: number[][] = [
        [128506, 80], // 80 - 128512 - 128592
        [129293, 46], // 46 - 129293 - 123339
    ]

    return range
        .map((v: number[], _: number) => {
            return [...Array(v[1])].map((_: number, i: number) => String.fromCodePoint(v[0] + i))
        })
        .reduce((o, c) => o.concat(c))
})()

/**
 * Binary class
 *
 * @property {string[]} bin - binary
 */
export class Binary {
    private bin: string[]

    /**
     * Encode string to binary Array
     *
     * @param {string} b64 - Base64 string
     */
    constructor(b64: string) {
        this.bin = atob(b64)
            .split('')
            .map((char: string) => {
                return char.charCodeAt(0).toString(2)
            })
    }

    /**
     * Decode binary Array to string
     *
     * @return {string} - UTF-8 string
     */
    public toUtf8(): string {
        return this.bin
            .map((bit: string) => {
                return String.fromCharCode(parseInt(bit, 2))
            })
            .join('')
    }
}
