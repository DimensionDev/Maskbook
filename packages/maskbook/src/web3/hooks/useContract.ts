import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem } from 'web3-utils'
import { useAccount } from './useAccount'
import { nonFunctionalWeb3 } from '../web3'

export function createContract<T extends Contract>(from: string, address: string, ABI: AbiItem[]) {
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
    const account = useAccount()
    return useMemo(() => createContract<T>(account, address, ABI), [account, address, ABI])
}

/**
 * Create many contracts with same ABI
 * @param listOfAddress
 * @param ABI
 */
export function useContracts<T extends Contract>(listOfAddress: string[], ABI: AbiItem[]) {
    const account = useAccount()
    const contracts = useMemo(() => listOfAddress.map((address) => createContract<T>(account, address, ABI)), [
        account,
        listOfAddress,
        ABI,
    ])
    return contracts.filter(Boolean) as T[]
}
