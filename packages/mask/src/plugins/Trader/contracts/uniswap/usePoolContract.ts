import PoolStateV3ABI from '@masknet/web3-contracts/abis/PoolStateV3.json'
import type { PoolStateV3 } from '@masknet/web3-contracts/types/PoolStateV3'
import { ChainId, useContract, useContracts } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function usePoolContract(address: string) {
    return useContract<PoolStateV3>(address, PoolStateV3ABI as AbiItem[])
}

export function usePoolContracts(listOfAddress: string[], chainId?: ChainId) {
    return useContracts<PoolStateV3>(listOfAddress, PoolStateV3ABI as AbiItem[], false, chainId)
}
