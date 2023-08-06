import type { AbiOutput } from 'web3-utils'
import { abiCoder } from './abiCoder.js'

export function decodeOutputString(abis: AbiOutput[], output: string) {
    if (abis.length === 1) return abiCoder.decodeParameter(abis[0], output)
    if (abis.length > 1) return abiCoder.decodeParameters(abis, output)
    return
}
