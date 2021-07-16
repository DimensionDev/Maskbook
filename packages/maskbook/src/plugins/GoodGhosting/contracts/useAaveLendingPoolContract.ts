import type { AbiItem } from 'web3-utils'
import AaveLendingPoolABI from '@masknet/web3-contracts/abis/AaveLendingPool.json'
import type { AaveLendingPool } from '@masknet/web3-contracts/types/AaveLendingPool'
import { useContract } from '@masknet/web3-shared'

export function useAaveLendingPoolContract(address: string) {
    return useContract<AaveLendingPool>(address, AaveLendingPoolABI as AbiItem[])
}
