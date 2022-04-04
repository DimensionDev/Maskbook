/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/prefer-for-of */
/**
 * @packageDocumentation
 * @module harmony-crypto
 * @hidden
 */

import { isAddress } from './validators'

import { toChecksumAddress } from './keyTool'
// This code is taken from https://github.com/sipa/bech32/tree/bdc264f84014c234e908d72026b7b780122be11f/ref/javascript
// Copyright (c) 2017 Pieter Wuille
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]

const polymod = (values: Buffer): number => {
    let chk = 1
    // tslint:disable-next-line
    for (let p = 0; p < values.length; p += 1) {
        // eslint-disable-next-line no-bitwise
        const top = chk >> 25
        // eslint-disable-next-line no-bitwise
        chk = ((chk & 0x1ffffff) << 5) ^ values[p]
        for (let i = 0; i < 5; i += 1) {
            // eslint-disable-next-line no-bitwise
            if ((top >> i) & 1) {
                // eslint-disable-next-line no-bitwise
                chk ^= GENERATOR[i]
            }
        }
    }
    return chk
}

const hrpExpand = (hrp: string): Buffer => {
    const ret = []
    let p
    for (p = 0; p < hrp.length; p += 1) {
        // eslint-disable-next-line no-bitwise
        ret.push(hrp.charCodeAt(p) >> 5)
    }
    ret.push(0)
    for (p = 0; p < hrp.length; ++p) {
        // eslint-disable-next-line no-bitwise
        ret.push(hrp.charCodeAt(p) & 31)
    }
    return Buffer.from(ret)
}

function verifyChecksum(hrp: string, data: Buffer) {
    return polymod(Buffer.concat([hrpExpand(hrp), data])) === 1
}

function createChecksum(hrp: string, data: Buffer) {
    const values = Buffer.concat([Buffer.from(hrpExpand(hrp)), data, Buffer.from([0, 0, 0, 0, 0, 0])])
    // var values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
    // eslint-disable-next-line no-bitwise
    const mod = polymod(values) ^ 1
    const ret = []
    for (let p = 0; p < 6; p += 1) {
        // eslint-disable-next-line no-bitwise
        ret.push((mod >> (5 * (5 - p))) & 31)
    }
    return Buffer.from(ret)
}

export const bech32Encode = (hrp: string, data: Buffer) => {
    const combined = Buffer.concat([data, createChecksum(hrp, data)])
    let ret = hrp + '1'
    // tslint:disable-next-line
    for (let p = 0; p < combined.length; p += 1) {
        ret += CHARSET.charAt(combined[p])
    }
    return ret
}

export const bech32Decode = (bechString: string) => {
    let p
    let hasLower = false
    let hasUpper = false
    for (p = 0; p < bechString.length; ++p) {
        if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
            return null
        }
        if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
            hasLower = true
        }
        if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
            hasUpper = true
        }
    }
    if (hasLower && hasUpper) {
        return null
    }
    bechString = bechString.toLowerCase()
    const pos = bechString.lastIndexOf('1')
    if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
        return null
    }
    const hrp = bechString.substring(0, pos)
    const data = []
    for (p = pos + 1; p < bechString.length; ++p) {
        const d = CHARSET.indexOf(bechString.charAt(p))
        if (d === -1) {
            return null
        }
        data.push(d)
    }

    if (!verifyChecksum(hrp, Buffer.from(data))) {
        return null
    }

    return { hrp, data: Buffer.from(data.slice(0, data.length - 6)) }
}

// HRP is the human-readable part of Harmony bech32 addresses
export const HRP = 'one'
export const tHRP = 'tone'

/**
 * convertBits
 *
 * groups buffers of a certain width to buffers of the desired width.
 *
 * For example, converts byte buffers to buffers of maximum 5 bit numbers,
 * padding those numbers as necessary. Necessary for encoding Ethereum-style
 * addresses as bech32 ones.
 *
 * @param {Buffer} data
 * @param {number} fromWidth
 * @param {number} toWidth
 * @param {boolean} pad
 * @returns {Buffer|null}
 */
export const convertBits = (data: Buffer, fromWidth: number, toWidth: number, pad = true) => {
    let acc = 0
    let bits = 0
    const ret = []
    // eslint-disable-next-line no-bitwise
    const maxv = (1 << toWidth) - 1
    // tslint:disable-next-line
    for (let p = 0; p < data.length; p += 1) {
        const value = data[p]
        // eslint-disable-next-line no-bitwise
        if (value < 0 || value >> fromWidth !== 0) {
            return null
        }
        // eslint-disable-next-line no-bitwise
        acc = (acc << fromWidth) | value
        bits += fromWidth
        while (bits >= toWidth) {
            bits -= toWidth
            ret.push((acc >> bits) & maxv)
        }
    }

    if (pad) {
        if (bits > 0) {
            ret.push((acc << (toWidth - bits)) & maxv)
        }
    } else if (bits >= fromWidth || (acc << (toWidth - bits)) & maxv) {
        return null
    }

    return Buffer.from(ret)
}

/**
 * toBech32Address
 *
 * bech32Encodes a canonical 20-byte Ethereum-style address as a bech32 Harmony
 * address.
 *
 * The expected format is one1<address><checksum> where address and checksum
 * are the result of bech32 encoding a Buffer containing the address bytes.
 *
 * @param {string} 20 byte canonical address
 * @returns {string} 38 char bech32 bech32Encoded Harmony address
 */
export const toBech32 = (address: string, useHRP: string = HRP): string => {
    if (!isAddress(address)) {
        throw new Error('Invalid address format.')
    }

    const addrBz = convertBits(Buffer.from(address.replace('0x', ''), 'hex'), 8, 5)

    if (addrBz === null) {
        throw new Error('Could not convert byte Buffer to 5-bit Buffer')
    }

    return bech32Encode(useHRP, addrBz)
}

/**
 * fromBech32Address
 *
 * @param {string} address - a valid Harmony bech32 address
 * @returns {string} a canonical 20-byte Ethereum-style address
 */
export const fromBech32 = (address: string, useHRP: string = HRP): string => {
    const res = bech32Decode(address)

    if (res === null) {
        throw new Error('Invalid bech32 address')
    }

    const { hrp, data } = res

    if (hrp !== useHRP) {
        throw new Error(`Expected hrp to be ${useHRP} but got ${hrp}`)
    }

    const buf = convertBits(data, 5, 8, false)

    if (buf === null) {
        throw new Error('Could not convert buffer to bytes')
    }

    return toChecksumAddress('0x' + buf.toString('hex'))
}
