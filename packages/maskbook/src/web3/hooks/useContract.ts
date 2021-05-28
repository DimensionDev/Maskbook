import { useMemo } from 'react'
import type { AbiItem } from 'web3-utils'
import { EthereumAddress } from 'wallet.ts'
import type { BaseContract } from '@dimensiondev/contracts/types/types'
import { nonFunctionalWeb3 } from '../web3'

function createContract<T extends BaseContract>(address: string, ABI: AbiItem[]) {
    if (!address || !EthereumAddress.isValid(address)) return null
    const contract = new nonFunctionalWeb3.eth.Contract(ABI, address) as unknown as T
    contract.transactionConfirmationBlocks = 1
    contract.transactionPollingTimeout = 5000
    return contract
}

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and decode the result of calls automaticallly
 * @param address
 * @param ABI
 */
export function useContract<T extends BaseContract>(address: string, ABI: AbiItem[]) {
    return useMemo(() => createContract<T>(address, ABI), [address, ABI])
}

/**
 * Create many contracts with same ABI
 * @param listOfAddress
 * @param ABI
 */
export function useContracts<T extends BaseContract>(listOfAddress: string[], ABI: AbiItem[]) {
    const contracts = useMemo(
        () => listOfAddress.map((address) => createContract<T>(address, ABI)),
        [listOfAddress, ABI],
    )
    return contracts.filter(Boolean) as T[]
}
