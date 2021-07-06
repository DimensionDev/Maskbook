import type { AbiItem } from 'web3-utils'
import PoolTogetherPoolABI from '@masknet/contracts/abis/PoolTogetherPool.json'
import type { PoolTogetherPool } from '@masknet/contracts/types/PoolTogetherPool'
import { useContract } from '@masknet/web3-shared'

export function usePoolTogetherPoolContract(address: string) {
    return useContract<PoolTogetherPool>(address, PoolTogetherPoolABI as AbiItem[])
}
