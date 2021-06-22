import type { AbiItem } from 'web3-utils'
import DHedgePoolABI from '@masknet/contracts/abis/DHedgePool.json'
import type { DHedgePool } from '@masknet/contracts/types/DHedgePool'
import { useContract } from '@masknet/web3-shared'

export function useDHedgePoolContract(address: string) {
    return useContract<DHedgePool>(address, DHedgePoolABI as AbiItem[])
}
