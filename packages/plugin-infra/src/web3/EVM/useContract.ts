import { useMemo } from 'react'
import type { AbiItem } from 'web3-utils'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, createContract } from '@masknet/web3-shared-evm'
import type { BaseContract } from '@masknet/web3-contracts/types/types'
import { useWeb3 } from '../useWeb3'

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and decode the result of calls automatically
 * @param address
 * @param ABI
 * @param chainId
 */
export function useContract<T extends BaseContract>(chainId?: ChainId, address = '', ABI: AbiItem[] = []) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useMemo(() => createContract<T>(web3, address, ABI), [web3, address, ABI])
}

/**
 * Create many contracts with same ABI
 * @param listOfAddress
 * @param ABI
 * @param chainId
 */
export function useContracts<T extends BaseContract>(
    chainId?: ChainId,
    listOfAddress: string[] = [],
    ABI: AbiItem[] = [],
) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useMemo(
        () => listOfAddress.map((address) => createContract<T>(web3, address, ABI)).filter(Boolean) as T[],
        [web3, JSON.stringify(listOfAddress), ABI],
    )
}
