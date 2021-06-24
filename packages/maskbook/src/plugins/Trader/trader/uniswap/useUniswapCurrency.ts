import { useMemo } from 'react'
import { useChainId } from '@masknet/web3-shared'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { toUniswapCurrency } from '../../helpers'

export function useUniswapCurrency(token?: FungibleTokenDetailed) {
    const chainId = useChainId()
    return useMemo(() => {
        if (!token) return
        return toUniswapCurrency(chainId, token)
    }, [chainId, JSON.stringify(token)])
}
