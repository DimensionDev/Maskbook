import type { AbiItem } from 'web3-utils'
import { abiCoder } from './abiCoder.js'

export function decodeFunctionData(abis: AbiItem[], input: string, methodName: string) {
    const item = abis.find((x) => x.type === 'function' && x.name === methodName)
    if (!item) throw new Error(`Failed to locate abi with name: ${methodName}.`)

    // Extract the types of the inputs from the ABI
    const inputTypes = item.inputs?.map((i) => i.type)
    if (!inputTypes) throw new Error('Invalid ABI type.')

    // Decode the input using web3.eth.abi.decodeParameters
    return abiCoder.decodeParameters(inputTypes, input)
}
