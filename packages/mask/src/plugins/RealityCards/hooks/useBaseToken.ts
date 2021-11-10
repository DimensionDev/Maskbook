import { useChainId } from '@masknet/web3-shared-evm/hooks'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm/types'
import { USDC } from '../constants'

export function useBaseToken(): FungibleTokenDetailed {
    const chainId = useChainId()
    return USDC[chainId]
}
