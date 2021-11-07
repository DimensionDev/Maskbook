import { FungibleTokenDetailed, useChainId } from '../../../../../web3-shared/evm'
import { USDC } from '../../Trader/constants'

export function useBaseToken(): FungibleTokenDetailed {
    const chainId = useChainId()
    return USDC[chainId]
}
