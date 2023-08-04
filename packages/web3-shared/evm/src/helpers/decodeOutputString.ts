import type { AbiOutput } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'

export function decodeOutputString(abis: AbiOutput[], output: string) {
    const coder = ABICoder as unknown as ABICoder.AbiCoder
    if (abis.length === 1) return coder.decodeParameter(abis[0], output)
    if (abis.length > 1) return coder.decodeParameters(abis, output)
    return
}
