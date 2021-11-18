import type { AbiItem } from 'web3-utils'
import type { GoodGhostingIncentives } from '@masknet/web3-contracts/types/GoodGhostingIncentives'
import GoodGhostingIncentivesABI from '@masknet/web3-contracts/abis/GoodGhostingIncentives.json'
import { useContract, useGoodGhostingConstants } from '@masknet/web3-shared-evm'

export function useGoodGhostingIncentiveContract() {
    const { GOOD_GHOSTING_INCENTIVES_CONTRACT_ADDRESS } = useGoodGhostingConstants()
    return useContract<GoodGhostingIncentives>(
        GOOD_GHOSTING_INCENTIVES_CONTRACT_ADDRESS,
        GoodGhostingIncentivesABI as AbiItem[],
    )
}
