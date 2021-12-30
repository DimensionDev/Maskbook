import type { AbiItem } from 'web3-utils'
import type { GoodGhostingPolygon } from '@masknet/web3-contracts/types/GoodGhostingPolygon'
import GoodGhostingPolygonABI from '@masknet/web3-contracts/abis/GoodGhostingPolygon.json'
import { useContract } from '@masknet/web3-shared-evm'

export function useGoodGhostingContract(address: string) {
    return useContract<GoodGhostingPolygon>(address, GoodGhostingPolygonABI as AbiItem[])
}
