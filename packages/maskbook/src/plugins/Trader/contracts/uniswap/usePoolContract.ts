import PoolStateV3ABI from '@masknet/web3-contracts/abis/PoolStateV3.json'
import type { PoolStateV3 } from '@masknet/web3-contracts/types/PoolStateV3'
import { useContract, useContracts } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function usePoolContract(address: string) {
    return useContract<PoolStateV3>(address, PoolStateV3ABI as AbiItem[])
}

export function usePoolContracts(listOfAddress: string[]) {
    return useContracts<PoolStateV3>(listOfAddress, PoolStateV3ABI as AbiItem[])
}
