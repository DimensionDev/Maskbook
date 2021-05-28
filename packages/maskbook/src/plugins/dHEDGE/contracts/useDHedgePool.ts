import type { AbiItem } from 'web3-utils'
import DHedgePoolABI from '@dimensiondev/contracts/abis/DHedgePool.json'
import type { DHedgePool } from '@dimensiondev/contracts/types/DHedgePool'
import { useContract } from '@dimensiondev/web3-shared'

export function useDHedgePoolContract(address: string) {
    return useContract<DHedgePool>(address, DHedgePoolABI as AbiItem[])
}
