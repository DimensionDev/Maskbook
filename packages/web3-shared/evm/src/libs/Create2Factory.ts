import { bytesToHex, hexToBytes, keccak256, padLeft, toHex } from 'web3-utils'
import { formatEthereumAddress } from '../index.js'

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
        const items = ['0xff', formatEthereumAddress(this.address), saltByte32, keccak256(initCode)].flatMap((x) =>
            hexToBytes(x),
        )
        return formatEthereumAddress(bytesToHex(hexToBytes(keccak256(bytesToHex(items))).slice(12)))
    }

    /** Derive all deploy addresses from the given initCode. */
    derive(initCode: string, length = Create2Factory.MAX_DERIVATION_NUM) {
        return Array.from({ length }).map((_, i) => this.getDeployAddress(initCode, i))
    }
}
