import { padLeft, toHex } from 'web3-utils'
import { keccak256 } from '@ethersproject/keccak256'
import { formatEthereumAddress } from '../index.js'
import { hexDataSlice, concat } from '@ethersproject/bytes'
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
        const items = ['0xff', formatEthereumAddress(this.address), saltByte32, keccak256(initCode)]

        return formatEthereumAddress(hexDataSlice(keccak256(concat(items)), 12))
    }

    /** Derive all deploy addresses from the given initCode. */
    derive(initCode: string, length = Create2Factory.MAX_DERIVATION_NUM) {
        return Array.from({ length }).map((_, i) => this.getDeployAddress(initCode, i))
    }
}
