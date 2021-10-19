import type { AbiItem } from 'web3-utils'
import AugurBalancerPoolABI from '@masknet/web3-contracts/abis/AugurBalancerPool.json'
import type { AugurBalancerPool } from '@masknet/web3-contracts/types/AugurBalancerPool'
import { useContract } from '@masknet/web3-shared-evm'

export function useBalancerPool(address: string) {
    return useContract<AugurBalancerPool>(address, AugurBalancerPoolABI as AbiItem[])
}
