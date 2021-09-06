import LosslessV2PoolABI from '@masknet/web3-contracts/abis/LosslessV2Pool.json'
import { useContract } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function usePoolContract(address?: string) {
    // todo types does not match, regenerate type file
    return useContract(address, LosslessV2PoolABI as unknown as AbiItem[])
}
