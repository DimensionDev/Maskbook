import type { AbiItem } from 'web3-utils'
import spaceStationGalaxy_ABI from '@masknet/web3-contracts/abis/SpaceStationGalaxy.json'
import type { SpaceStationGalaxy } from '@masknet/web3-contracts/types/SpaceStationGalaxy'
import { ChainId, useSpaceStationGalaxyConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useSpaceStationContract(chainId?: ChainId) {
    const { CONTRACT_ADDRESS } = useSpaceStationGalaxyConstants()
    return useContract<SpaceStationGalaxy>(chainId, CONTRACT_ADDRESS, spaceStationGalaxy_ABI as AbiItem[])
}
