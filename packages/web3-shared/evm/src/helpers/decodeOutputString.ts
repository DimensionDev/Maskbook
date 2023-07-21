import type { AbiOutput } from 'web3-utils'
import { AbiCoder } from 'web3-eth-abi'

export function decodeOutputString(abis: AbiOutput[], output: string) {
    const coder = new AbiCoder()
    if (abis.length === 1) return coder.decodeParameter(abis[0], output)
    if (abis.length > 1) return coder.decodeParameters(abis, output)
    return
}
