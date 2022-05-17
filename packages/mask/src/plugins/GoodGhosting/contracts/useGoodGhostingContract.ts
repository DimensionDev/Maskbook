import type { AbiItem } from 'web3-utils'
import type { GoodGhostingPolygon } from '@masknet/web3-contracts/types/GoodGhostingPolygon'
import GoodGhostingPolygonABI from '@masknet/web3-contracts/abis/GoodGhostingPolygon.json'
import { useChainId, useContract } from '@masknet/web3-shared-evm'

export function useGoodGhostingContract(address: string) {
    const chainId = useChainId()
    return useContract<GoodGhostingPolygon>(chainId, address, GoodGhostingPolygonABI as AbiItem[])
}
