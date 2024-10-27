import { useMemo } from 'react'
import type { AbiItem } from 'web3-utils'
import { EMPTY_LIST } from '@masknet/shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { type ChainId, createContract } from '@masknet/web3-shared-evm'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and decode the result of calls automatically
 * @param address
 * @param ABI
 * @param chainId
 */
export function useContract<T extends BaseContract>(chainId?: ChainId, address = '', ABI: AbiItem[] = EMPTY_LIST) {
    return useMemo(() => createContract<T>(EVMWeb3.getWeb3({ chainId }), address, ABI), [address, ABI])
}

/**
 * Create many contracts with same ABI
 * @param listOfAddress
 * @param ABI
 * @param chainId
 */
export function useContracts<T extends BaseContract>(
    chainId?: ChainId,
    listOfAddress: string[] = EMPTY_LIST,
    ABI: AbiItem[] = EMPTY_LIST,
) {
    return useMemo(
        () =>
            listOfAddress
                .map((address) => createContract<T>(EVMWeb3.getWeb3({ chainId }), address, ABI))
                .filter(Boolean) as T[],
        // eslint-disable-next-line react-compiler/react-compiler
        [JSON.stringify(listOfAddress), ABI],
    )
}
