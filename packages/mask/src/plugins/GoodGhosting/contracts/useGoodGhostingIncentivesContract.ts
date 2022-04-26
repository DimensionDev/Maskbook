import type { AbiItem } from 'web3-utils'
import type { GoodGhostingIncentives } from '@masknet/web3-contracts/types/GoodGhostingIncentives'
import GoodGhostingIncentivesABI from '@masknet/web3-contracts/abis/GoodGhostingIncentives.json'
import { ChainId, useGoodGhostingConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useGoodGhostingIncentiveContract(chainId?: ChainId) {
    const { GOOD_GHOSTING_INCENTIVES_CONTRACT_ADDRESS } = useGoodGhostingConstants()
    return useContract<GoodGhostingIncentives>(
        chainId,
        GOOD_GHOSTING_INCENTIVES_CONTRACT_ADDRESS,
        GoodGhostingIncentivesABI as AbiItem[],
    )
}
