import { useMemo } from 'react'
import { EVMWeb3 } from '@masknet/web3-providers'
import { type ChainId, createContract } from '@masknet/web3-shared-evm'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import type { Abi } from 'viem'

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and decode the result of calls automatically
 */
export function useContract<T extends BaseContract>(chainId: ChainId, address: string | undefined, abi: Abi) {
    return useMemo(() => createContract<T>(EVMWeb3.getWeb3({ chainId }), address, abi), [address, abi])
}
