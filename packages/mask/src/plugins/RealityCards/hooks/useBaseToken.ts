import { FungibleTokenDetailed, useChainId } from '@masknet/web3-shared-evm'
import { USDC } from '../constants'

export function useBaseToken(): FungibleTokenDetailed {
    const chainId = useChainId()
    return USDC[chainId]
}
