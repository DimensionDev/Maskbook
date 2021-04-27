import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem } from 'web3-utils'
import { nonFunctionalWeb3 } from '../web3'

function createContract<T extends Contract>(address: string, ABI: AbiItem[]) {
    if (!address || !EthereumAddress.isValid(address)) return null
    return (new nonFunctionalWeb3.eth.Contract(ABI, address) as unknown) as T
}

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and decode the result of calls automaticallly
 * @param address
 * @param ABI
 */
export function useContract<T extends Contract>(address: string, ABI: AbiItem[]) {
    return useMemo(() => createContract<T>(address, ABI), [address, ABI])
}

/**
 * Create many contracts with same ABI
 * @param listOfAddress
 * @param ABI
 */
export function useContracts<T extends Contract>(listOfAddress: string[], ABI: AbiItem[]) {
    const contracts = useMemo(() => listOfAddress.map((address) => createContract<T>(address, ABI)), [
        listOfAddress,
        ABI,
    ])
    return contracts.filter(Boolean) as T[]
}
