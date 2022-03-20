import type { AbiItem } from 'web3-utils'
import { useContract, useIdeaMarketConstants } from '@masknet/web3-shared-evm'
import IdeaMarketMultiActionABI from '@masknet/web3-contracts/abis/IdeaMarketMultiAction.json'

import type { IdeaMarketMultiActionContract } from '@masknet/web3-contracts/types/IdeaMarketMultiActionContract'

export function useIdeaMarketMultiActionContract() {
    const { MULTI_ACTION_CONTRACT } = useIdeaMarketConstants()
    const multiActionContract = useContract<IdeaMarketMultiActionContract>(
        MULTI_ACTION_CONTRACT,
        IdeaMarketMultiActionABI as AbiItem[],
    )
    return multiActionContract
}
