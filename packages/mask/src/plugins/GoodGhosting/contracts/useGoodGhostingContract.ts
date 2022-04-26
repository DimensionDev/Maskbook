import type { AbiItem } from 'web3-utils'
import type { GoodGhostingPolygon } from '@masknet/web3-contracts/types/GoodGhostingPolygon'
import GoodGhostingPolygonABI from '@masknet/web3-contracts/abis/GoodGhostingPolygon.json'
import { useContract } from '@masknet/plugin-infra/web3-evm'
import type { ChainId } from '@masknet/web3-shared-evm'

export function useGoodGhostingContract(chainId?: ChainId, address?: string) {
    return useContract<GoodGhostingPolygon>(chainId, address, GoodGhostingPolygonABI as AbiItem[])
}
