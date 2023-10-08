import type { AbiItem } from 'web3-utils'
import { abiCoder } from './abiCoder.js'

export function decodeOutputString(abis: AbiItem[], output: string, methodName: string) {
    const item = abis.find((x) => x.type === 'function' && x.name === methodName)
    if (!item) throw new Error(`Failed to locate abi with name: ${methodName}.`)
    const outputs = item.outputs ?? []
    if (outputs.length === 1) return abiCoder.decodeParameter(outputs[0], output)
    if (outputs.length > 1) return abiCoder.decodeParameters(outputs, output)
    return
}
