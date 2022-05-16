import type { AbiItem } from 'web3-utils'
import PoolTogetherPoolABI from '@masknet/web3-contracts/abis/PoolTogetherPool.json'
import type { PoolTogetherPool } from '@masknet/web3-contracts/types/PoolTogetherPool'
import { useContract } from '@masknet/plugin-infra/src/entry-web3-evm'
import type { ChainId } from '@masknet/web3-shared-evm'

export function usePoolTogetherPoolContract(chainId: ChainId, address?: string) {
    return useContract<PoolTogetherPool>(chainId, address, PoolTogetherPoolABI as AbiItem[])
}
