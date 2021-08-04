import type { AbiItem } from 'web3-utils'
import SpaceStationUUPS_ABI from '@masknet/web3-contracts/abis/SpaceStationUUPS.json'
import type { SpaceStationUUPS } from '@masknet/web3-contracts/types/SpaceStationUUPS'
import { useSpaceStationUUPSConstants, useContract } from '@masknet/web3-shared'

export function useSpaceStationContract() {
    const { CONTRACT_ADDRESS } = useSpaceStationUUPSConstants()
    return useContract<SpaceStationUUPS>(CONTRACT_ADDRESS, SpaceStationUUPS_ABI as AbiItem[])
}
