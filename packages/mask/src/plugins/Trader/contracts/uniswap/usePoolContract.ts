import PoolStateV3ABI from '@masknet/web3-contracts/abis/PoolStateV3.json'
import type { PoolStateV3 } from '@masknet/web3-contracts/types/PoolStateV3'
import { ChainId, useChainId, useContract, useContracts } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function usePoolContract(address: string) {
    const chainId = useChainId()
    return useContract<PoolStateV3>(chainId, address, PoolStateV3ABI as AbiItem[])
}

export function usePoolContracts(listOfAddress: string[], chainId?: ChainId) {
    const _chainId = useChainId()
    return useContracts<PoolStateV3>(chainId ?? _chainId, listOfAddress, PoolStateV3ABI as AbiItem[])
}
