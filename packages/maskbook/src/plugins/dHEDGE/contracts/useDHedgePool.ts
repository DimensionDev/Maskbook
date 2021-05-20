import type { AbiItem } from 'web3-utils'
import { useContract } from '../../../web3/hooks/useContract'
import DHedgePoolABI from '@dimensiondev/contracts/abis/DHedgePool.json'
import type { DHedgePool } from '@dimensiondev/contracts/types/DHedgePool'

export function useDHedgePoolContract(address: string) {
    return useContract<DHedgePool>(address, DHedgePoolABI as AbiItem[])
}
