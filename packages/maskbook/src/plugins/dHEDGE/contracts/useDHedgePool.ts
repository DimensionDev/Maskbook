import type { AbiItem } from 'web3-utils'
import DHedgePoolABI from '@masknet/web3-contracts/abis/DHedgePool.json'
import type { DHedgePool } from '@masknet/web3-contracts/types/DHedgePool'
import { useContract } from '@masknet/web3-shared'

export function useDHedgePoolContract(address?: string) {
    return useContract<DHedgePool>(address, DHedgePoolABI as AbiItem[])
}
