import type { AbiItem } from 'web3-utils'
import { abiCoder } from './abiCoder.js'
import type { AbiFunctionFragment } from 'web3-types'

export function decodeFunctionParams(abis: AbiItem[], input: string, methodName: string) {
    const item = abis.find((x) => x.type === 'function' && (x as AbiFunctionFragment).name === methodName)
    if (!item) throw new Error(`Failed to locate abi with name: ${methodName}.`)
    if (!item.inputs) throw new Error('Invalid ABI type.')

    const signature = abiCoder.encodeFunctionSignature(item as AbiFunctionFragment)
    if (!input.startsWith(signature)) {
        throw new Error(`Function Signature not matched! signature: ${signature}, input: ${input}`)
    }
    // Decode the input using web3.eth.abi.decodeParameters
    // https://github.com/web3/web3.js/issues/7136
    return abiCoder.decodeParameters([...((item as AbiFunctionFragment).inputs || [])], `0x${input.slice(10)}`)
}
