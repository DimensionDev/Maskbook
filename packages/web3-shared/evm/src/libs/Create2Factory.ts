import { keccak256, padLeft, toHex } from 'web3-utils'

export class Create2Factory {
    static MAX_DERIVATION_NUM = 99

    /**
     * Create2Factory
     *
     * @param address The contract address of Create2Factory
     */
    constructor(private address: string) {}

    private getDeployAddress(initCode: string, salt: number): string {
        const saltByte32 = padLeft(toHex(salt), 32)
        const items = ['0xff', this.address, saltByte32, keccak256(initCode)].map((x) => toHex(x).slice(2))
        return `0x${keccak256(items.join('')).slice(-40)}`
    }

    /** Derive all deploy addresses from the given initCode. */
    derive(initCode: string, length = Create2Factory.MAX_DERIVATION_NUM) {
        return Array.from({ length }).map((_, i) => this.getDeployAddress(initCode, i))
    }
}
