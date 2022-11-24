import { keccak256, padLeft, toHex } from 'web3-utils'

export class Create2Factory {
    constructor(private address: string) {}

    getDeployedAddress(initCode: string, salt: string): string {
        const saltByte32 = padLeft(toHex(salt), 32)
        const items = ['0xff', this.address, saltByte32, keccak256(initCode)].map((x) => toHex(x).slice(2))
        return `0x${keccak256(items.join('')).slice(-40)}`
    }
}
