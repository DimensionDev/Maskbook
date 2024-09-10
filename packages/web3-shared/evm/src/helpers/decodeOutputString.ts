import type { AbiItem } from 'web3-utils'
import { abiCoder } from './abiCoder.js'
import type { AbiFunctionFragment } from 'web3-types'

export function decodeOutputString(abis: AbiItem[], output: string, methodName: string) {
    const item = abis.find((x) => x.type === 'function' && (x as AbiFunctionFragment).name === methodName)
    if (!item) throw new Error(`Failed to locate abi with name: ${methodName}.`)
    const outputs = (item as AbiFunctionFragment).outputs ?? []
    if (outputs.length === 1) return abiCoder.decodeParameter(outputs[0], output)
    // https://github.com/web3/web3.js/issues/7136
    if (outputs.length > 1) return abiCoder.decodeParameters([...outputs], output)
    return
}
