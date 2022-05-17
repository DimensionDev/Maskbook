import type { AbiItem } from 'web3-utils'
import PoolTogetherPoolABI from '@masknet/web3-contracts/abis/PoolTogetherPool.json'
import type { PoolTogetherPool } from '@masknet/web3-contracts/types/PoolTogetherPool'
import { useChainId, useContract } from '@masknet/web3-shared-evm'

export function usePoolTogetherPoolContract(address?: string) {
    const chainId = useChainId()
    return useContract<PoolTogetherPool>(chainId, address, PoolTogetherPoolABI as AbiItem[])
}
