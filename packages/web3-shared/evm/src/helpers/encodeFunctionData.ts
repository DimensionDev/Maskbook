import type { AbiItem } from 'web3-utils'
import { abiCoder } from './abiCoder.js'

/**
 * Encode function call data as input string of an evm transaction.
 * @param abis
 * @param args
 * @param methodName
 * @returns
 */
export function encodeFunctionData(abis: AbiItem[], args: string[], methodName: string) {
    const item = abis.find((x) => x.type === 'function' && x.name === methodName)
    if (!item) throw new Error(`Failed to locate abi with name: ${methodName}.`)
    return abiCoder.encodeFunctionCall(item, args)
}
