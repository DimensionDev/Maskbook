import { useMemo } from 'react'
import { useChainId } from '../../../../web3/hooks/useChainId'
import type { FungibleTokenDetailed } from '../../../../web3/types'
import { toUniswapCurrency } from '../../helpers'

export function useUniswapCurrency(token?: FungibleTokenDetailed) {
    const chainId = useChainId()
    return useMemo(() => {
        if (!token) return
        return toUniswapCurrency(chainId, token)
    }, [chainId, JSON.stringify(token)])
}
