import type { AbiItem } from 'web3-utils'
import { abiCoder } from './abiCoder.js'

export function decodeOutputString(abis: AbiItem[], output: string, methodName: string) {
    if (abis.length === 1) return abiCoder.decodeParameter(abis[0], output)
    if (abis.length > 1) return abiCoder.decodeParameters(abis, output)
    return
}
