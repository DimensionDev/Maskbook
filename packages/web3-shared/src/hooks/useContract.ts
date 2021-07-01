import type Web3 from 'web3'
import { useMemo } from 'react'
import type { AbiItem } from 'web3-utils'
import { EthereumAddress } from 'wallet.ts'
import type { BaseContract } from '@masknet/contracts/types/types'
import { useWeb3 } from './useWeb3'

function createContract<T extends BaseContract>(web3: Web3, address: string, ABI: AbiItem[]) {
    if (!address || !EthereumAddress.isValid(address)) return null
    const contract = new web3.eth.Contract(ABI, address) as unknown as T
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
    const web3 = useWeb3()
    return useMemo(() => createContract<T>(web3, address, ABI), [web3, address, ABI])
}

/**
 * Create many contracts with same ABI
 * @param listOfAddress
 * @param ABI
 */
export function useContracts<T extends BaseContract>(listOfAddress: string[], ABI: AbiItem[]) {
    const web3 = useWeb3()
    const contracts = useMemo(
        () => listOfAddress.map((address) => createContract<T>(web3, address, ABI)),
        [web3, listOfAddress, ABI],
    )
    return contracts.filter(Boolean) as T[]
}
