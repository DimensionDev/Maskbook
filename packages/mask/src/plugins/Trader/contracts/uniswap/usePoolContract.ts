import { useContract, useContracts } from '@masknet/plugin-infra/web3-evm'
import PoolStateV3ABI from '@masknet/web3-contracts/abis/PoolStateV3.json'
import type { PoolStateV3 } from '@masknet/web3-contracts/types/PoolStateV3'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function usePoolContract(chainId?: ChainId, address?: string) {
    return useContract<PoolStateV3>(chainId, address, PoolStateV3ABI as AbiItem[])
}

export function usePoolContracts(chainId?: ChainId, listOfAddress: string[] = []) {
    return useContracts<PoolStateV3>(chainId, listOfAddress, PoolStateV3ABI as AbiItem[])
}
