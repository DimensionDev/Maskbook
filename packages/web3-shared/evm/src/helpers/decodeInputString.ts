import type { AbiItem } from 'web3-utils'
import { abiCoder } from './abiCoder.js'

function findABIForMethod(abi: AbiItem[], methodName: string) {
    for (let item of abi) {
        if (item.name === methodName && item.type === 'function') {
            return item
        }
    }
    return null
}

export function decodeInputString(abi: AbiItem[], input: string, methodName: string) {
    const abiItem = findABIForMethod(abi, methodName)
    if (!abiItem) throw new Error('transfer method not found in ABI')

    // Extract the types of the inputs from the ABI
    const inputTypes = abiItem.inputs?.map((i) => i.type)
    if (!inputTypes) throw new Error('Invalid ABI type.')

    // Decode the input using web3.eth.abi.decodeParameters
    return abiCoder.decodeParameters(inputTypes, input)
}
