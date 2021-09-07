import LosslessV2PoolABI from '@masknet/web3-contracts/abis/LosslessV2Pool.json'
import type { LosslessV2Pool } from '@masknet/web3-contracts/types/LosslessV2Pool'
import { useContract } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function usePoolContract(address?: string) {
    return useContract<LosslessV2Pool>(address, LosslessV2PoolABI.abi as AbiItem[])
}
