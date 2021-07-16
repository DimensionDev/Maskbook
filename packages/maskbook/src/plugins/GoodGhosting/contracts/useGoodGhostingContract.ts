import type { AbiItem } from 'web3-utils'
import type { GoodGhostingPolygon } from '@masknet/web3-contracts/types/GoodGhostingPolygon'
import GoodGhostingPolygonABI from '@masknet/web3-contracts/abis/GoodGhostingPolygon.json'
import { useContract, useGoodGhostingConstants } from '@masknet/web3-shared'

export function useGoodGhostingContract() {
    const { GOOD_GHOSTING_CONTRACT_ADDRESS } = useGoodGhostingConstants()
    return useContract<GoodGhostingPolygon>(GOOD_GHOSTING_CONTRACT_ADDRESS, GoodGhostingPolygonABI as AbiItem[])
}
