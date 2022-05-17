import type { AbiItem } from 'web3-utils'
import spaceStationGalaxy_ABI from '@masknet/web3-contracts/abis/SpaceStationGalaxy.json'
import type { SpaceStationGalaxy } from '@masknet/web3-contracts/types/SpaceStationGalaxy'
import { useSpaceStationGalaxyConstants, useContract, useChainId } from '@masknet/web3-shared-evm'

export function useSpaceStationContract() {
    const chainId = useChainId()
    const { CONTRACT_ADDRESS } = useSpaceStationGalaxyConstants()
    return useContract<SpaceStationGalaxy>(chainId, CONTRACT_ADDRESS, spaceStationGalaxy_ABI as AbiItem[])
}
