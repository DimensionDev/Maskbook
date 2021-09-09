import type { AbiItem } from 'web3-utils'
import spaceStationGalaxy_ABI from '@masknet/web3-contracts/abis/spaceStationGalaxy.json'
import type { spaceStationGalaxy } from '@masknet/web3-contracts/types/spaceStationGalaxy'
import { useSpaceStationGalaxyConstants, useContract } from '@masknet/web3-shared'

export function useSpaceStationContract() {
    const { CONTRACT_ADDRESS } = useSpaceStationGalaxyConstants()
    return useContract<spaceStationGalaxy>(CONTRACT_ADDRESS, spaceStationGalaxy_ABI as AbiItem[])
}
