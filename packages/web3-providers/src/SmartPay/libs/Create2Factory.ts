import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

export class Create2Factory {
    static MAX_DERIVATION_NUM = 99

    /**
     * Create2Factory
     *
     * @param address The contract address of Create2Factory
     */
    constructor(private address: string) {}

    private getDeployAddress(initCode: string, salt: number): string {
        const saltByte32 = web3_utils.padLeft(web3_utils.toHex(salt), 64)
        const items = ['0xff', formatEthereumAddress(this.address), saltByte32, web3_utils.keccak256(initCode)].flatMap(
            (x) => web3_utils.hexToBytes(x),
        )
        return formatEthereumAddress(
            web3_utils.bytesToHex(web3_utils.hexToBytes(web3_utils.keccak256(web3_utils.bytesToHex(items))).slice(12)),
        )
    }

    derive(initCode: string, nonce: number) {
        return this.getDeployAddress(initCode, nonce)
    }

    /** Derive multiple times from the given initCode. */
    deriveUntil(initCode: string, length = Create2Factory.MAX_DERIVATION_NUM) {
        return Array.from({ length }).map((_, i) => this.getDeployAddress(initCode, i))
    }
}
