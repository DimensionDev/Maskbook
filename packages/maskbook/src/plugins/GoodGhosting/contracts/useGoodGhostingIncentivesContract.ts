import type { AbiItem } from 'web3-utils'
import type { GoodGhostingIncentives } from '@masknet/contracts/types/GoodGhostingIncentives'
import GoodGhostingIncentivesABI from '@masknet/contracts/abis/GoodGhostingIncentives.json'
import { useContract, useGoodGhostingConstants } from '@masknet/web3-shared'

export function useGoodGhostingIncentiveContract() {
    const { GOOD_GHOSTING_INCENTIVES_CONTRACT_ADDRESS } = useGoodGhostingConstants()
    return useContract<GoodGhostingIncentives>(
        GOOD_GHOSTING_INCENTIVES_CONTRACT_ADDRESS,
        GoodGhostingIncentivesABI as AbiItem[],
    )
}
