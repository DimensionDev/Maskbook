import { useMemo } from 'react'
import { type ChainId, createContractWithAddress } from '@masknet/web3-shared-evm'
import type { Abi } from 'viem'

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and decode the result of calls automatically
 * @param address
 * @param abi
 * @param chainId
 */
export function useContract<TAbi extends Abi>(chainId: ChainId, address: string | undefined, abi: TAbi) {
    return useMemo(() => {
        void chainId
        return createContractWithAddress(address, abi)
    }, [address, abi, chainId])
}
