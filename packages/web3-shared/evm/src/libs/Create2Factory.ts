import { padLeft, toHex } from 'web3-utils'
import { keccak256 } from '@ethersproject/keccak256'
import { arrayify, hexDataSlice, concat } from '@ethersproject/bytes'

function getChecksumAddress(address: string): string {
    address = address.toLowerCase()

    const chars = address.slice(2).split('')

    const expanded = new Uint8Array(40)
    for (let i = 0; i < 40; i += 1) {
        expanded[i] = chars[i].charCodeAt(0)
    }

    const hashed = arrayify(keccak256(expanded))

    for (let i = 0; i < 40; i += 2) {
        // eslint-disable-next-line no-bitwise
        if (hashed[i >> 1] >> 4 >= 8) {
            chars[i] = chars[i].toUpperCase()
        }
        // eslint-disable-next-line no-bitwise
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase()
        }
    }

    return '0x' + chars.join('')
}

export class Create2Factory {
    static MAX_DERIVATION_NUM = 99

    /**
     * Create2Factory
     *
     * @param address The contract address of Create2Factory
     */
    constructor(private address: string) {}

    private getDeployAddress(initCode: string, salt: number): string {
        const saltByte32 = padLeft(toHex(salt), 64)
        const items = ['0xff', getChecksumAddress(this.address), saltByte32, keccak256(initCode)]

        return getChecksumAddress(hexDataSlice(keccak256(concat(items)), 12))
    }

    /** Derive all deploy addresses from the given initCode. */
    derive(initCode: string, length = Create2Factory.MAX_DERIVATION_NUM) {
        return Array.from({ length }).map((_, i) => this.getDeployAddress(initCode, i))
    }
}
